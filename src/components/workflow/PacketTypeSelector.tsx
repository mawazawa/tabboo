/**
 * Packet Type Selector Component
 *
 * Allows users to select which type of TRO packet they need to file.
 * Displays three options with descriptions and form requirements.
 *
 * @version 1.0
 * @date November 17, 2025
 */

import React from 'react';
import { Circle } from '@/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PacketType } from '@/types/WorkflowTypes';

interface PacketTypeSelectorProps {
  onSelect: (packetType: PacketType) => void;
  onCancel: () => void;
}

/**
 * PacketTypeSelector - Packet type selection modal
 *
 * Renders three packet type options:
 * 1. Filing for DV restraining order with children
 * 2. Filing for DV restraining order without children
 * 3. Responding to a restraining order request
 */
export const PacketTypeSelector: React.FC<PacketTypeSelectorProps> = ({
  onSelect,
  onCancel
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Choose Your TRO Packet Type</CardTitle>
        <CardDescription>
          Select the type of restraining order packet you need to file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {/* Initiating TRO with Children */}
          <button
            onClick={() => onSelect(PacketType.INITIATING_WITH_CHILDREN)}
            className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Filing for Domestic Violence Restraining Order (With Children)
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You are seeking protection from domestic violence and have children involved.
                  This packet includes child custody and visitation orders.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">DV-100</Badge>
                  <Badge variant="secondary">CLETS-001</Badge>
                  <Badge variant="secondary">DV-105</Badge>
                  <Badge variant="outline">FL-150 (optional)</Badge>
                </div>
              </div>
            </div>
          </button>

          {/* Initiating TRO without Children */}
          <button
            onClick={() => onSelect(PacketType.INITIATING_WITHOUT_CHILDREN)}
            className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Filing for Domestic Violence Restraining Order (No Children)
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You are seeking protection from domestic violence without child custody issues.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">DV-100</Badge>
                  <Badge variant="secondary">CLETS-001</Badge>
                  <Badge variant="outline">FL-150 (optional)</Badge>
                </div>
              </div>
            </div>
          </button>

          {/* Response to TRO */}
          <button
            onClick={() => onSelect(PacketType.RESPONSE)}
            className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Responding to a Restraining Order Request
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You have been served with a restraining order request and need to file a response.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">DV-120</Badge>
                  <Badge variant="outline">FL-150 (optional)</Badge>
                  <Badge variant="outline">FL-320 (optional)</Badge>
                </div>
              </div>
            </div>
          </button>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PacketTypeSelector;
