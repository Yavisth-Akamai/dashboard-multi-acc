export interface InstanceTypeMapping {
    id: string;
    memorySizeGB: number;
    description: string;
  }
  
  export const INSTANCE_TYPE_MAPPINGS: InstanceTypeMapping[] = [
    { id: 'g6-dedicated-2', memorySizeGB: 4, description: 'Dedicated 4GB' },
    { id: 'g6-dedicated-4', memorySizeGB: 8, description: 'Dedicated 8GB' },
    { id: 'g6-dedicated-8', memorySizeGB: 16, description: 'Dedicated 16GB' },
    { id: 'g6-dedicated-16', memorySizeGB: 32, description: 'Dedicated 32GB' },
    { id: 'g6-dedicated-32', memorySizeGB: 64, description: 'Dedicated 64GB' },
    { id: 'g6-dedicated-48', memorySizeGB: 96, description: 'Dedicated 96GB' },
    { id: 'g6-dedicated-50', memorySizeGB: 128, description: 'Dedicated 128GB' },
    { id: 'g6-dedicated-56', memorySizeGB: 256, description: 'Dedicated 256GB' }
  ];
  
  export function getMemorySizeFromInstanceType(instanceType: string): number {
    const mapping = INSTANCE_TYPE_MAPPINGS.find(m => instanceType.includes(m.id));
    return mapping ? mapping.memorySizeGB : 0;
  }
  
  export function getDescriptionFromInstanceType(instanceType: string): string {
    const mapping = INSTANCE_TYPE_MAPPINGS.find(m => instanceType.includes(m.id));
    return mapping ? mapping.description : 'Unknown';
  }
  
  export function determineProfileType(memorySizeGB: number, nodeCount: number): 'D' | 'DHA' | 'S' | 'M' | 'L' {
    if (memorySizeGB >= 32) {
      return 'L';
    } else if (memorySizeGB === 16) {
      return nodeCount <= 16 ? 'S' : 'M';
    } else if (memorySizeGB === 8) {
      return nodeCount <= 7 ? 'D' : 'DHA';
    } else {
      return 'D';
    }
  }