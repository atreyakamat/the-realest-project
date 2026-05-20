'use client';

import { useActionState } from 'react';
import { createPropertyAction } from '../../app/actions/properties';
import { Button, Input, Select, Textarea } from '../ui';

const initialState = { message: '', error: '' };

export function PropertyComposer() {
  const [state, action, pending] = useActionState(createPropertyAction, initialState);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <Input name="title" placeholder="Property title" required className="md:col-span-2" />
      <Input name="location" placeholder="Location" required />
      <Input name="address" placeholder="Full address" />
      <Select name="propertyType" defaultValue="Apartment">
        {['Apartment', 'Villa', 'Plot', 'Commercial', 'Rental'].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Input name="price" type="number" placeholder="Price (₹)" required />
      <Input name="size" placeholder="Size (e.g. 1500 sqft)" />
      <Input name="bedrooms" type="number" placeholder="Bedrooms" />
      <Input name="bathrooms" type="number" placeholder="Bathrooms" />
      <Input name="floor" placeholder="Floor" />
      <Select name="furnishing" defaultValue="Unfurnished">
        {['Unfurnished', 'Semi-furnished', 'Fully-furnished'].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Select name="status" defaultValue="Available">
        {['Available', 'Hold', 'Sold', 'Rented'].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Textarea name="description" placeholder="Description" className="md:col-span-2" />

      {state?.error ? <p className="md:col-span-2 text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="md:col-span-2 text-sm text-emerald-300">{state.message}</p> : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Create property'}
        </Button>
      </div>
    </form>
  );
}
