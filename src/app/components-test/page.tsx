'use client';

import React from 'react';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoSelect } from '@/components/ui/NeoSelect';

export default function ComponentsTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Components Test Page</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">NeoButton Examples</h2>
        <div className="flex flex-wrap gap-4">
          <NeoButton primaryColor="#4C7BF4">Default Blue</NeoButton>
          <NeoButton primaryColor="#FF6B6B">Coral Red</NeoButton>
          <NeoButton primaryColor="#FFFFFF">White</NeoButton>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">NeoButton Sizes</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <NeoButton size="sm">Small Button</NeoButton>
          <NeoButton size="md">Medium Button</NeoButton>
          <NeoButton size="lg">Large Button</NeoButton>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">NeoButton States</h2>
        <div className="flex flex-wrap gap-4">
          <NeoButton disabled>Disabled Button</NeoButton>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">NeoButton Custom Colors</h2>
        <div className="flex flex-wrap gap-4">
          <NeoButton primaryColor="#FF0000">Red Button</NeoButton>
          <NeoButton primaryColor="#00FF00">Green Button</NeoButton>
          <NeoButton primaryColor="#0000FF">Blue Button</NeoButton>
          <NeoButton primaryColor="#FFFFFF">White Button</NeoButton>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          NeoButton Custom Text Colors
        </h2>
        <div className="flex flex-wrap gap-4">
          <NeoButton
            primaryColor="#4C7BF4"
            textColor="#FFD700"
          >
            Gold Text
          </NeoButton>
          <NeoButton
            primaryColor="#4C7BF4"
            textColor="#FF69B4"
          >
            Pink Text
          </NeoButton>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">NeoButton Rotation</h2>
        <div className="flex flex-wrap gap-4">
          <NeoButton rotate>Rotated Button</NeoButton>
          <NeoButton>Normal Button</NeoButton>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">NeoButton Types</h2>
        <div className="flex flex-wrap gap-4">
          <NeoButton type="button">Button Type</NeoButton>
          <NeoButton type="submit">Submit Type</NeoButton>
          <NeoButton type="reset">Reset Type</NeoButton>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">NeoSelect Examples</h2>
        <div className="flex flex-wrap gap-4">
          <NeoSelect
            items={['Option 1', 'Option 2', 'Option 3']}
            value={0}
            onChange={(value) => console.log('Selected:', value)}
          />
          <NeoSelect
            items={['Red', 'Green', 'Blue']}
            value={1}
            onChange={(value) => console.log('Selected:', value)}
          />
        </div>
      </section>
    </div>
  );
}
