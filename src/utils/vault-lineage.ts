/**
 * Vault Data Lineage Utilities
 * 
 * Maps vault fields to human-readable source categories for UI tooltips.
 * Used to show users exactly where their autofilled data is coming from.
 */

export type VaultCategory = 
  | 'Attorney Information'
  | 'Address Details'
  | 'Contact Info'
  | 'Personal Info'
  | 'System Metadata'
  | 'Personal Vault';

export const getVaultSourceCategory = (vaultField: string): VaultCategory => {
  switch (vaultField) {
    case 'attorney_name':
    case 'bar_number':
    case 'firm_name':
      return 'Attorney Information';
    
    case 'street_address':
    case 'city':
    case 'state':
    case 'zip_code':
      return 'Address Details';
    
    case 'telephone_no':
    case 'fax_no':
    case 'email_address':
      return 'Contact Info';
    
    case 'full_name':
      return 'Personal Info';
      
    case 'created_at':
    case 'updated_at':
    case 'user_id':
      return 'System Metadata';
      
    default:
      return 'Personal Vault';
  }
};

export const getVaultSourceLabel = (vaultField: string): string => {
  const category = getVaultSourceCategory(vaultField);
  // Format field name from snake_case to Title Case
  const readableField = vaultField
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return `${category} > ${readableField}`;
};

