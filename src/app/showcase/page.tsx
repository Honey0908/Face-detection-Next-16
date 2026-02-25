'use client';

import { useState } from 'react';
import { Users, Utensils, TrendingUp, Search, Check, X } from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Icon,
  Avatar,
  Card,
  FormField,
  SearchField,
  StatCard,
} from '@/components';

export default function DesignSystemShowcase() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Design System Showcase
          </h1>
          <p className="text-gray-600">All components from our design system</p>
        </div>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Buttons</h2>
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="highlight">Highlight</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="flex items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">States</h3>
                <div className="flex gap-3">
                  <Button disabled>Disabled</Button>
                  <Button variant="primary">Active</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Inputs & Form Fields */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Inputs & Form Fields</h2>
          <Card padding="lg">
            <div className="space-y-6 max-w-md">
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Input</h3>
                <Input placeholder="Enter text..." />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Input Sizes</h3>
                <div className="space-y-2">
                  <Input size="sm" placeholder="Small input" />
                  <Input size="md" placeholder="Medium input" />
                  <Input size="lg" placeholder="Large input" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Error State</h3>
                <Input error placeholder="Invalid input" />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Form Field</h3>
                <FormField
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Form Field with Error
                </h3>
                <FormField
                  label="Username"
                  type="text"
                  error="Username is already taken"
                  placeholder="johndoe"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Search Field</h3>
                <SearchField
                  placeholder="Search employees..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue('')}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Badges</h2>
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="neutral">Neutral</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="flex items-center gap-3">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Icons */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Icons</h2>
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="flex items-center gap-4">
                  <Icon icon={Users} size="sm" />
                  <Icon icon={Users} size="md" />
                  <Icon icon={Users} size="lg" />
                  <Icon icon={Users} size="xl" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">With Colors</h3>
                <div className="flex gap-4">
                  <Icon icon={Check} size="lg" className="text-success" />
                  <Icon icon={X} size="lg" className="text-error" />
                  <Icon icon={Search} size="lg" className="text-primary" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Avatars */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Avatars</h2>
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="flex items-center gap-3">
                  <Avatar initials="AB" size="xs" />
                  <Avatar initials="CD" size="sm" />
                  <Avatar initials="EF" size="md" />
                  <Avatar initials="GH" size="lg" />
                  <Avatar initials="IJ" size="xl" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="md">
              <h3 className="font-semibold mb-2">Default Card</h3>
              <p className="text-gray-600">Basic card with medium padding</p>
            </Card>

            <Card padding="sm">
              <h3 className="font-semibold mb-2">Small Padding</h3>
              <p className="text-gray-600">Card with small padding</p>
            </Card>

            <Card padding="lg" hover>
              <h3 className="font-semibold mb-2">Hoverable Card</h3>
              <p className="text-gray-600">Hover for shadow effect</p>
            </Card>
          </div>
        </section>

        {/* Stat Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Stat Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Scans Today"
              value={234}
              icon={Utensils}
              trend={{
                value: '+12%',
                direction: 'up',
                positive: true,
              }}
            />

            <StatCard title="Total Employees" value={456} icon={Users} />

            <StatCard
              title="Monthly Average"
              value="4,560"
              icon={TrendingUp}
              description="Based on last 30 days"
              trend={{
                value: '-3%',
                direction: 'down',
                positive: false,
              }}
            />
          </div>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
          <Card padding="lg">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Primary Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="h-20 rounded-lg bg-primary mb-2"></div>
                    <p className="text-sm font-medium">Primary</p>
                    <p className="text-xs text-gray-500">#8100D1</p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-secondary mb-2"></div>
                    <p className="text-sm font-medium">Secondary</p>
                    <p className="text-xs text-gray-500">#B500B2</p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-accent mb-2"></div>
                    <p className="text-sm font-medium">Accent</p>
                    <p className="text-xs text-gray-500">#FF52A0</p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-highlight mb-2"></div>
                    <p className="text-sm font-medium">Highlight</p>
                    <p className="text-xs text-gray-500">#FFA47F</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Semantic Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="h-20 rounded-lg bg-success mb-2"></div>
                    <p className="text-sm font-medium">Success</p>
                    <p className="text-xs text-gray-500">#10B981</p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-error mb-2"></div>
                    <p className="text-sm font-medium">Error</p>
                    <p className="text-xs text-gray-500">#EF4444</p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-warning mb-2"></div>
                    <p className="text-sm font-medium">Warning</p>
                    <p className="text-xs text-gray-500">#F59E0B</p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-info mb-2"></div>
                    <p className="text-sm font-medium">Info</p>
                    <p className="text-xs text-gray-500">#3B82F6</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
