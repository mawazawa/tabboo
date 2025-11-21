# San Francisco Superior Court Judges & Clerks Directory

## Overview

This directory contains information about San Francisco Superior Court judges and their clerks, sourced from the codebase's organizational data and publicly available court records.

## Directory Structure

```
judges/
├── README.md                      # This file
├── judges-directory.json          # Comprehensive judge and clerk database
├── monica-f-wiley.jpg            # Judge Monica F. Wiley (Family Law)
├── richard-b-ulmer.jpg           # Judge Richard B. Ulmer (General Civil/Discovery)
└── clerks/                        # Directory for clerk photos (future)
```

## Judges Overview

### Downloaded Photos (2/5)

| Judge | Department | Photo | Status |
|-------|-----------|-------|--------|
| Richard B. Ulmer Jr. | 302 (Discovery/Law & Motion) | ✅ richard-b-ulmer.jpg | Downloaded - 7.4 MB |
| Monica F. Wiley | 403/405 (Family Law) | ✅ monica-f-wiley.jpg | Downloaded - 812 KB |

### Pending Photos (3/5)

| Judge | Department | Photo | Notes |
|-------|-----------|-------|-------|
| Rochelle C. East | 206 (Presiding Judge/Master Calendar) | ⏳ Searching | First female Hispanic/Native American Presiding Judge |
| Charles F. Haines | 501 (Housing/Evictions) | ⏳ Searching | Housing law specialist, 24 years tenure |
| Victor M. Hwang | 502 (Criminal Trial Court) | ⏳ Searching | Civil rights attorney background, 25 years prior |

## Judge Information

### Rochelle C. East (Presiding Judge, Dept 206)
- **Title:** Presiding Judge & Civil Master Calendar / Settlements
- **Appointed:** May 21, 2013 (Gov. Jerry Brown)
- **Education:** Stanford University (B.A.) / University of San Francisco School of Law (J.D.)
- **Bar:** #183792 (1996)
- **Phone:** 415-551-3705
- **Location:** Civic Center Courthouse, Room 206
- **Clerks:** Jhulie Roque, Robert Woods, Vanessa Wu
- **Notable:** First female Presiding Judge of Hispanic/Native American descent

### Charles F. Haines (Judge, Dept 501)
- **Title:** Housing / Evictions
- **Appointed:** 2001
- **Tenure:** 24 years (2001-Present)
- **Education:** Villanova University / Tulane University School of Law
- **Phone:** 415-551-3762
- **Location:** Real Property Court
- **Notable:** Known for rulings on eviction moratoriums and vacant property taxes

### Richard B. Ulmer Jr. (Judge, Dept 302)
- **Title:** Discovery / Law & Motion
- **Appointed:** 2009 (Gov. Arnold Schwarzenegger)
- **Education:** University of Nebraska at Omaha (1977) / Stanford University School of Law
- **Phone:** 415-551-3723 / 415-551-3823
- **Location:** Civic Center Courthouse
- **Clerks:** Mars Goodman, Madelle Macadangdang
- **Photo:** ✅ Downloaded (7.4 MB from Daily Journal Judicial Profile, 2021)
- **Notable:** Former newspaper reporter; known for sparse writing style

### Monica F. Wiley (Judge, Dept 403/405)
- **Title:** Family Law / Unified Family Court Supervising Judge
- **Appointed:** September 1, 2009 (Gov. Arnold Schwarzenegger)
- **Education:** UC Berkeley (B.A., 1992) / Howard University School of Law (J.D., Cum Laude, 1995)
- **Phone:** 415-551-3741 / 415-551-3747
- **Location:** Civic Center Courthouse
- **Clerks:** Tyler Gutierrez, Josh Mandapat, Sylvia Tam
- **Photo:** ✅ Downloaded (812 KB from SF.gov Official Profile, 2024)
- **Notable:** Second African American female judge on SF bench; Supervising Judge of UFC since 2018

### Victor M. Hwang (Judge, Dept 502)
- **Title:** Criminal Trial Court / Civil Trials
- **Elected:** November 8, 2016 (took office January 2017)
- **Education:** UC Berkeley (B.A. in English, 1989) / USC Gould School of Law (J.D., 1992)
- **Bar:** #162467 (1992)
- **Phone:** 415-551-3768
- **Location:** Hall of Justice
- **Notable:** 25-year civil rights attorney with expertise in hate crimes and human trafficking

## Photo Sources

### Successfully Downloaded

1. **Monica F. Wiley**
   - Source: SF.gov Official Judge Profile
   - URL: https://media.api.sf.gov/original_images/Monica_Wiley_7uJVvqS.jpg
   - Size: 812 KB
   - Format: JPEG (3005×3756, 376 DPI)
   - Date: 2024

2. **Richard B. Ulmer Jr.**
   - Source: Daily Journal Judicial Profile (Article: "Decisive", Feb. 11, 2021)
   - URL: https://s3-us-west-2.amazonaws.com/dailyjournal-prod/articles/images/000/361/444/original/Ulmer_Richard_%285%29.jpg
   - Size: 7.4 MB
   - Format: JPEG (4737×3158, 200 DPI)
   - Camera: Canon EOS 5D Mark III

### Search Strategy for Remaining Judges

**Rochelle C. East:**
- Searched: Official SF Court website, Ballotpedia, Trellis Law, Daily Journal
- Issue: No public portrait photos available online
- Recommendation: Contact SF Court Public Information (415-551-3683, Melinka Jones)

**Charles F. Haines:**
- Searched: Ballotpedia, Daily Journal, SF Court records
- Issue: Only profile placeholder on Ballotpedia
- Recommendation: Contact SF Court PR or request from judicial office

**Victor M. Hwang:**
- Searched: LinkedIn, UC Law San Francisco, Trellis Law, Ballotpedia
- Issue: Ballotpedia shows placeholder, no official portrait found
- Recommendation: Contact SF Court or check UC Law SF official resources

## Usage

### Load Judge Directory

```typescript
import judgesData from '@/public/judges/judges-directory.json';

// Access judge information
const east = judgesData.judges.find(j => j.id === 'judge_001');
console.log(east.name, east.phone);

// Get clerks for a judge
const clerks = east.clerks;
clerks.forEach(clerk => console.log(clerk.name, clerk.role));
```

### Display Judge Photos

```tsx
<img 
  src="/judges/monica-f-wiley.jpg" 
  alt="Judge Monica F. Wiley"
  width={300}
  height={400}
/>
```

## To-Do: Obtaining Remaining Photos

1. **Contact SF Court Public Affairs** (415-551-5737)
   - Request official judge portrait photos
   - Mention specific names: Rochelle East, Charles Haines, Victor Hwang

2. **Check Alternative Sources**
   - Attorney General's website (for Rochelle East)
   - State Bar of California judge directory
   - Local San Francisco legal publications

3. **Consider Professional Photography**
   - If photos are not available online, consider purchasing from:
   - Daily Journal (judicial profiles)
   - Court-provided official portraits
   - Professional photographer session

## Last Updated

**Date:** November 21, 2025
**By:** Claude Code
**Status:** 2/5 photos downloaded, comprehensive directory created

## Notes

- Judge names and information sourced from `/src/components/canvas/constants.ts` in the codebase
- Clerk information sourced from October 2025 SF Superior Court Department Listing
- All phone numbers verified from official SF Court records
- Photos are official/public sources suitable for legal technology applications

---

**Contact Information:**
- SF Superior Court General Information: (415) 551-4000
- Public Affairs: (415) 551-5737
- Court Website: https://sf.courts.ca.gov
