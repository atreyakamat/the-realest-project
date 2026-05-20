import { getDashboardMetrics, getLeads, getProperties } from './data';

export async function getReportsData(organizationId: string | null) {
  const [metrics, leads, properties] = await Promise.all([
    getDashboardMetrics(organizationId),
    getLeads(organizationId),
    getProperties(organizationId),
  ]);

  const sources = leads.reduce<Record<string, number>>((accumulator, lead) => {
    const source = lead.source ?? 'Manual';
    accumulator[source] = (accumulator[source] ?? 0) + 1;
    return accumulator;
  }, {});

  const statuses = leads.reduce<Record<string, number>>((accumulator, lead) => {
    const status = lead.status ?? 'New';
    accumulator[status] = (accumulator[status] ?? 0) + 1;
    return accumulator;
  }, {});

  const won = leads.filter((lead) => lead.status === 'Won').length;
  const lost = leads.filter((lead) => lead.status === 'Lost').length;

  return {
    metrics,
    sources,
    statuses,
    won,
    lost,
    properties,
    leads,
  };
}
