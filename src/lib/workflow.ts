import type { LeadRecord, PropertyRecord } from './estateflow-types';

export type WorkflowPriority = 'High' | 'Medium' | 'Low';

export type WorkflowAction = {
  id: 'call_now' | 'send_matches' | 'book_visit' | 'manager_review' | 'nurture';
  label: string;
  description: string;
};

export type PropertyMatch = {
  property: PropertyRecord;
  score: number;
  reasons: string[];
};

export type LeadWorkflowInsight = {
  priority: WorkflowPriority;
  priorityScore: number;
  nextAction: WorkflowAction;
  reason: string;
  propertyMatches: PropertyMatch[];
};

const statusWeights: Record<string, number> = {
  New: 70,
  Contacted: 60,
  Interested: 50,
  'Site Visit Scheduled': 40,
  Negotiation: 30,
  Won: 0,
  Lost: 0,
  'Not Responding': 20,
};

const temperatureWeights: Record<string, number> = {
  Hot: 20,
  Warm: 10,
  Cold: 0,
};

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function currencyWindow(lead: LeadRecord) {
  const min = lead.budget_min ?? 0;
  const max = lead.budget_max ?? 0;

  if (!min && !max) {
    return null;
  }

  return { min, max: max || min };
}

function scorePropertyMatch(lead: LeadRecord, property: PropertyRecord): PropertyMatch {
  let score = 0;
  const reasons: string[] = [];
  const leadType = normalize(lead.property_type);
  const propertyType = normalize(property.property_type);
  const leadLocation = normalize(lead.preferred_location);
  const propertyLocation = normalize(property.location);
  const budget = currencyWindow(lead);

  if (leadType && propertyType && leadType === propertyType) {
    score += 35;
    reasons.push(`matches ${property.property_type ?? 'property type'}`);
  }

  if (leadLocation && propertyLocation) {
    if (leadLocation === propertyLocation) {
      score += 30;
      reasons.push(`same location as ${lead.preferred_location}`);
    } else if (leadLocation.includes(propertyLocation) || propertyLocation.includes(leadLocation)) {
      score += 18;
      reasons.push('near preferred location');
    }
  }

  if (budget && property.price) {
    if (property.price >= budget.min && property.price <= budget.max) {
      score += 30;
      reasons.push('fits the budget');
    } else {
      const midpoint = (budget.min + budget.max) / 2;
      const gap = Math.abs(property.price - midpoint) / Math.max(midpoint, 1);
      if (gap <= 0.2) {
        score += 12;
        reasons.push('close to target budget');
      }
    }
  }

  if (property.availability_status === 'Available') {
    score += 12;
    reasons.push('available now');
  } else if (property.availability_status === 'Hold') {
    score -= 8;
    reasons.push('on hold');
  } else if (property.availability_status === 'Sold' || property.availability_status === 'Rented') {
    score -= 40;
    reasons.push('not currently available');
  }

  if ((property.units_available ?? 0) > 1) {
    score += 4;
    reasons.push('multiple units available');
  }

  if ((property.tags ?? []).some((tag) => normalize(tag).includes('hot'))) {
    score += 4;
    reasons.push('flagged as a hot property');
  }

  return {
    property,
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
}

function buildNextAction(lead: LeadRecord): WorkflowAction {
  const status = lead.status ?? 'New';
  const temperature = lead.temperature ?? 'Warm';
  const overdueFollowUp = lead.next_followup ? new Date(lead.next_followup).getTime() < Date.now() : false;

  if (status === 'Won' || status === 'Lost') {
    return {
      id: 'nurture',
      label: 'Move to long-term nurture',
      description: 'Keep the relationship warm with periodic updates and new inventory alerts.',
    };
  }

  if (status === 'Negotiation') {
    return {
      id: 'manager_review',
      label: 'Escalate to manager review',
      description: 'Review concessions, pricing, and the next negotiation move before the lead cools off.',
    };
  }

  if (status === 'Site Visit Scheduled') {
    return {
      id: 'book_visit',
      label: 'Send visit reminder',
      description: 'Confirm the site visit timing and share a map, contact, and shortlist before arrival.',
    };
  }

  if (status === 'Interested' || overdueFollowUp) {
    return {
      id: 'book_visit',
      label: 'Book a site visit',
      description: 'Send the best matches now and convert the lead while intent is still high.',
    };
  }

  if (status === 'Contacted' || temperature === 'Hot') {
    return {
      id: 'send_matches',
      label: 'Send matched properties',
      description: 'Share the top property shortlist and ask for the quickest available visit slot.',
    };
  }

  return {
    id: 'call_now',
    label: 'Call within 15 minutes',
    description: 'High-intent leads convert faster when the first response is immediate and human.',
  };
}

function buildReason(lead: LeadRecord, action: WorkflowAction) {
  const parts = [lead.temperature === 'Hot' ? 'hot lead' : null, lead.status ? `${lead.status.toLowerCase()} stage` : null]
    .filter(Boolean)
    .join(', ');

  if (parts) {
    return `This lead is in the ${parts}, so the workflow should prioritize: ${action.label.toLowerCase()}.`;
  }

  return `The workflow should prioritize: ${action.label.toLowerCase()}.`;
}

export function getLeadWorkflowInsight(lead: LeadRecord, properties: PropertyRecord[]): LeadWorkflowInsight {
  const rankedMatches = properties
    .map((property) => scorePropertyMatch(lead, property))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const priorityScore = Math.min(
    100,
    (statusWeights[lead.status ?? 'New'] ?? 40) + (temperatureWeights[lead.temperature ?? 'Warm'] ?? 0) + (lead.next_followup ? 10 : 0),
  );

  const priority: WorkflowPriority = priorityScore >= 80 ? 'High' : priorityScore >= 50 ? 'Medium' : 'Low';
  const nextAction = buildNextAction(lead);

  return {
    priority,
    priorityScore,
    nextAction,
    reason: buildReason(lead, nextAction),
    propertyMatches: rankedMatches,
  };
}

export function getWorkflowQueue(leads: LeadRecord[], properties: PropertyRecord[], limit = 3) {
  return leads
    .map((lead) => ({
      lead,
      ...getLeadWorkflowInsight(lead, properties),
      urgencyScore:
        (statusWeights[lead.status ?? 'New'] ?? 40) +
        (temperatureWeights[lead.temperature ?? 'Warm'] ?? 0) +
        (lead.next_followup && new Date(lead.next_followup).getTime() < Date.now() ? 25 : 0),
    }))
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, limit);
}
