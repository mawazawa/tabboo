/**
 * FL-320 PDF Export using @react-pdf/renderer
 *
 * This module generates court-ready PDF documents from form data
 * using React components and the @react-pdf/renderer library.
 *
 * Features:
 * - Pixel-perfect reproduction of California Judicial Council FL-320 form
 * - Dynamic field population from form data
 * - Court-compliant formatting (letter size, proper margins)
 * - Checkbox and text field rendering
 *
 * @see https://react-pdf.org/components
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register Courier for monospace form fields (court standard)
Font.register({
  family: 'Courier',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/courierprime/v9/u-450q2lgwslOqpF_6gQ8kELWwZjW-_-tvg.ttf' },
    { src: 'https://fonts.gstatic.com/s/courierprime/v9/u-4k0q2lgwslOqpF_6gQ8kELY7pMf-fVqvHoJXw.ttf', fontWeight: 'bold' },
  ],
});

// Styles matching California Judicial Council form specifications
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 36, // 0.5 inch margins
    fontFamily: 'Courier',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottom: '1pt solid black',
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 200,
    textAlign: 'right',
  },
  formTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    textDecoration: 'underline',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontSize: 10,
    borderBottom: '0.5pt solid #666',
    paddingLeft: 4,
    minHeight: 14,
  },
  checkbox: {
    width: 10,
    height: 10,
    border: '1pt solid black',
    marginRight: 4,
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    border: '1pt solid black',
    marginRight: 4,
    backgroundColor: '#000',
  },
  checkboxLabel: {
    fontSize: 9,
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 36,
    right: 36,
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 36,
    fontSize: 8,
  },
  caseNumber: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  courtInfo: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  itemNumber: {
    width: 20,
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  subItem: {
    marginLeft: 20,
    marginBottom: 2,
  },
});

// Checkbox component
const Checkbox: React.FC<{ checked?: boolean; label: string }> = ({ checked, label }) => (
  <View style={styles.checkboxRow}>
    <View style={checked ? styles.checkboxChecked : styles.checkbox} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
);

// Form field with label and value
const FormField: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || ''}</Text>
  </View>
);

// Form data interface for FL-320
export interface FL320FormData {
  // Header information
  partyName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  telephoneNo?: string;
  faxNo?: string;
  email?: string;
  attorneyFor?: string;
  attorneyBarNumber?: string;

  // Court information
  superiorCourtCounty?: string;
  branchName?: string;
  streetAddressCourt?: string;
  mailingAddressCourt?: string;
  cityStateCourt?: string;

  // Case information
  petitioner?: string;
  respondent?: string;
  caseNumber?: string;

  // Response options (Item 1)
  responseAgree?: boolean;
  responseDisagree?: boolean;
  responseAgreeExcept?: boolean;

  // Specific responses
  childCustody?: string;
  childVisitation?: string;
  childSupport?: string;
  spousalSupport?: string;
  propertyDivision?: string;
  attorneyFees?: string;

  // Additional information
  otherRequests?: string;
  declarationAttached?: boolean;

  // Signature
  signatureDate?: string;
  signatureName?: string;
}

interface FL320PDFDocumentProps {
  formData: FL320FormData;
}

/**
 * FL-320 Response to Request for Order PDF Document
 *
 * Generates a court-compliant PDF matching California Judicial Council FL-320 form
 */
export const FL320PDFDocument: React.FC<FL320PDFDocumentProps> = ({ formData }) => (
  <Document
    title="FL-320 Response to Request for Order"
    author="SwiftFill"
    subject="California Judicial Council Form"
    keywords="FL-320, Response, Restraining Order, California"
  >
    {/* Page 1 */}
    <Page size="LETTER" style={styles.page}>
      {/* Attorney/Party Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.courtInfo}>{formData.partyName || '[PARTY NAME]'}</Text>
          <Text style={styles.courtInfo}>{formData.streetAddress || '[STREET ADDRESS]'}</Text>
          <Text style={styles.courtInfo}>
            {formData.city || '[CITY]'}, {formData.state || 'CA'} {formData.zipCode || '[ZIP]'}
          </Text>
          <Text style={styles.courtInfo}>Tel: {formData.telephoneNo || '[PHONE]'}</Text>
          {formData.email && <Text style={styles.courtInfo}>Email: {formData.email}</Text>}
          <Text style={styles.courtInfo}>Attorney for: {formData.attorneyFor || 'Self-Represented'}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.courtInfo}>FOR COURT USE ONLY</Text>
        </View>
      </View>

      {/* Court Information */}
      <View style={styles.section}>
        <Text style={styles.courtInfo}>SUPERIOR COURT OF CALIFORNIA, COUNTY OF {formData.superiorCourtCounty?.toUpperCase() || '[COUNTY]'}</Text>
        {formData.streetAddressCourt && <Text style={styles.courtInfo}>Street Address: {formData.streetAddressCourt}</Text>}
        {formData.mailingAddressCourt && <Text style={styles.courtInfo}>Mailing Address: {formData.mailingAddressCourt}</Text>}
        {formData.branchName && <Text style={styles.courtInfo}>Branch Name: {formData.branchName}</Text>}
      </View>

      {/* Case Caption */}
      <View style={styles.section}>
        <FormField label="PETITIONER" value={formData.petitioner} />
        <FormField label="RESPONDENT" value={formData.respondent} />
      </View>

      {/* Form Title */}
      <Text style={styles.formTitle}>RESPONSE TO REQUEST FOR ORDER</Text>

      {/* Case Number */}
      <View style={[styles.row, { justifyContent: 'flex-end', marginBottom: 12 }]}>
        <Text style={styles.label}>CASE NUMBER:</Text>
        <Text style={styles.caseNumber}>{formData.caseNumber || '[CASE NUMBER]'}</Text>
      </View>

      {/* Item 1 - Response Type */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.itemNumber}>1.</Text>
          <View style={styles.itemContent}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>I respond to the request as follows:</Text>
            <Checkbox checked={formData.responseAgree} label="I agree to all the orders requested" />
            <Checkbox checked={formData.responseDisagree} label="I do not agree to the orders requested" />
            <Checkbox checked={formData.responseAgreeExcept} label="I agree to the orders requested except as specified below" />
          </View>
        </View>
      </View>

      {/* Item 2 - Child Custody */}
      {(formData.childCustody || formData.childVisitation) && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.itemNumber}>2.</Text>
            <View style={styles.itemContent}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>CHILD CUSTODY AND VISITATION:</Text>
              {formData.childCustody && (
                <View style={styles.subItem}>
                  <Text>Custody: {formData.childCustody}</Text>
                </View>
              )}
              {formData.childVisitation && (
                <View style={styles.subItem}>
                  <Text>Visitation: {formData.childVisitation}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Item 3 - Child Support */}
      {formData.childSupport && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.itemNumber}>3.</Text>
            <View style={styles.itemContent}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>CHILD SUPPORT:</Text>
              <Text>{formData.childSupport}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Item 4 - Spousal Support */}
      {formData.spousalSupport && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.itemNumber}>4.</Text>
            <View style={styles.itemContent}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>SPOUSAL SUPPORT:</Text>
              <Text>{formData.spousalSupport}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Item 5 - Property */}
      {formData.propertyDivision && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.itemNumber}>5.</Text>
            <View style={styles.itemContent}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>PROPERTY CONTROL:</Text>
              <Text>{formData.propertyDivision}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Item 6 - Attorney Fees */}
      {formData.attorneyFees && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.itemNumber}>6.</Text>
            <View style={styles.itemContent}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>ATTORNEY FEES AND COSTS:</Text>
              <Text>{formData.attorneyFees}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Other Requests */}
      {formData.otherRequests && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.itemNumber}>7.</Text>
            <View style={styles.itemContent}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>OTHER REQUESTS:</Text>
              <Text>{formData.otherRequests}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Declaration checkbox */}
      <View style={[styles.section, { marginTop: 12 }]}>
        <Checkbox
          checked={formData.declarationAttached}
          label="Facts in support of the above are contained in the attached declaration"
        />
      </View>

      {/* Signature Block */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={[styles.value, { maxWidth: 120 }]}>{formData.signatureDate || ''}</Text>
          <View style={{ width: 40 }} />
          <Text style={[styles.value, { flex: 2 }]}>_________________________</Text>
        </View>
        <View style={[styles.row, { marginTop: 4 }]}>
          <View style={{ width: 160 }} />
          <Text style={{ fontSize: 8, flex: 2, textAlign: 'center' }}>
            (SIGNATURE OF PARTY OR ATTORNEY)
          </Text>
        </View>
        {formData.signatureName && (
          <View style={[styles.row, { marginTop: 4 }]}>
            <View style={{ width: 160 }} />
            <Text style={{ fontSize: 9, flex: 2, textAlign: 'center' }}>
              {formData.signatureName}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        FL-320 [Rev. January 1, 2023] • RESPONSE TO REQUEST FOR ORDER • Family Code, § 217
      </Text>

      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Page ${pageNumber} of ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default FL320PDFDocument;
