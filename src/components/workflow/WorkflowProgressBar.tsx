/**
 * Workflow Progress Bar Component
 *
 * Displays overall workflow completion with progress bar,
 * percentage, packet type title, and estimated time remaining.
 *
 * @version 1.0
 * @date November 17, 2025
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PacketType } from '@/types/WorkflowTypes';

interface WorkflowProgressBarProps {
  packetType: PacketType;
  completionPercentage: number;
  estimatedTime: number;
}

/**
 * Get human-readable packet type title
 */
const getPacketTypeTitle = (packetType: PacketType): string => {
  switch (packetType) {
    case PacketType.INITIATING_WITH_CHILDREN:
      return 'Filing for Restraining Order (With Children)';
    case PacketType.INITIATING_WITHOUT_CHILDREN:
      return 'Filing for Restraining Order (No Children)';
    case PacketType.RESPONSE:
      return 'Responding to Restraining Order Request';
    case PacketType.MODIFICATION:
      return 'Modifying Existing Restraining Order';
    default:
      return 'TRO Packet Workflow';
  }
};

/**
 * WorkflowProgressBar - Overall workflow progress display
 *
 * Shows completion percentage with visual progress bar,
 * packet type description, and time estimate.
 */
export const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({
  packetType,
  completionPercentage,
  estimatedTime
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>TRO Packet Workflow</CardTitle>
            <CardDescription>
              {getPacketTypeTitle(packetType)}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={completionPercentage} className="h-2" />

        {estimatedTime > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Estimated time remaining: {estimatedTime} minutes
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowProgressBar;
