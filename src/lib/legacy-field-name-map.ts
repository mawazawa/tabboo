export const legacyFieldNameToIndex: Record<string, number> = {
  // Header - Party/Attorney Information (0-12)
  partyName: 0,
  firmName: 1,
  streetAddress: 2,
  mailingAddress: 3,
  city: 4,
  state: 5,
  zipCode: 6,
  telephoneNo: 7,
  faxNo: 8,
  email: 9,
  attorneyFor: 10,
  stateBarNumber: 11,

  // Header - Court Information (12-16)
  county: 12,
  courtStreetAddress: 13,
  courtMailingAddress: 14,
  courtCityAndZip: 15,
  branchName: 16,

  // Header - Case Information (17-24)
  petitioner: 17,
  respondent: 18,
  otherParentParty: 19,
  caseNumber: 20,
  hearingDate: 21,
  hearingTime: 22,
  hearingDepartment: 23,
  hearingRoom: 24,

  // Item 1: Restraining Order Information (25-26)
  restrainingOrderNone: 25,
  restrainingOrderActive: 26,

  // Item 2: Child Custody/Visitation (27-31)
  childCustodyConsent: 27,
  visitationConsent: 28,
  childCustodyDoNotConsent: 29,
  visitationDoNotConsent: 30,
  custodyAlternativeOrder: 31,

  // Item 3: Child Support (32-36)
  childSupportFiledFL150: 32,
  childSupportConsent: 33,
  childSupportGuidelineConsent: 34,
  childSupportDoNotConsent: 35,
  childSupportAlternativeOrder: 36,

  // Item 4: Spousal Support (37-40)
  spousalSupportFiledFL150: 37,
  spousalSupportConsent: 38,
  spousalSupportDoNotConsent: 39,
  spousalSupportAlternativeOrder: 40,

  // Item 5: Property Control (41-43)
  propertyControlConsent: 41,
  propertyControlDoNotConsent: 42,
  propertyControlAlternativeOrder: 43,

  // Item 6: Attorney's Fees (44-48)
  attorneyFeesFiledFL150: 44,
  attorneyFeesFiledFL158: 45,
  attorneyFeesConsent: 46,
  attorneyFeesDoNotConsent: 47,
  attorneyFeesAlternativeOrder: 48,

  // Item 7: Domestic Violence Order (49-51)
  domesticViolenceConsent: 49,
  domesticViolenceDoNotConsent: 50,
  domesticViolenceAlternativeOrder: 51,

  // Item 8: Other Orders (52-54)
  otherOrdersConsent: 52,
  otherOrdersDoNotConsent: 53,
  otherOrdersAlternativeOrder: 54,

  // Item 9: Time for Service (55-57)
  timeForServiceConsent: 55,
  timeForServiceDoNotConsent: 56,
  timeForServiceAlternativeOrder: 57,

  // Item 10: Facts (58-59)
  facts: 58,
  factsAttachment: 59,

  // Signature Section (60-63)
  declarationUnderPenalty: 60,
  signatureDate: 61,
  printName: 62,
  signatureName: 63,
};

