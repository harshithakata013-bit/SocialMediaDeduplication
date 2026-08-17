/**
 * dataService.js
 * Centralized CSV data loading service using PapaParse.
 * All data comes from /public/data/ (served as static assets by Vite).
 */

import Papa from 'papaparse';

const BASE = '/data';

/**
 * Generic CSV loader with error handling.
 */
async function loadCSV(filename, options = {}) {
  const url = `${BASE}/${filename}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch ${filename}`);
    }
    const text = await response.text();
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // we'll cast manually to control errors
      ...options,
    });
    if (result.errors && result.errors.length > 0) {
      const serious = result.errors.filter(e => e.type !== 'Quotes');
      if (serious.length > 0) {
        console.warn(`[dataService] Parse warnings in ${filename}:`, serious.slice(0, 5));
      }
    }
    return result.data;
  } catch (err) {
    console.error(`[dataService] Error loading ${filename}:`, err);
    throw err;
  }
}

// ---- KPIs ----
export async function loadKPIs() {
  const rows = await loadCSV('dashboard_kpis.csv');
  const kpis = {};
  rows.forEach(r => {
    const key = (r.Metric || '').trim();
    const val = parseFloat((r.Value || '').toString().replace(/,/g, ''));
    if (key) kpis[key] = isNaN(val) ? r.Value : val;
  });
  return kpis;
}

// ---- Customer Status ----
export async function loadCustomerStatus() {
  const rows = await loadCSV('dashboard_customer_status.csv');
  return rows.map(r => ({
    status: (r.Customer_Status || '').trim(),
    count: parseInt(r.Count, 10) || 0,
  })).filter(r => r.status);
}

// ---- Gender ----
export async function loadGender() {
  const rows = await loadCSV('dashboard_gender.csv');
  return rows.map(r => ({
    gender: (r.Gender || '').trim(),
    count: parseInt(r.Count, 10) || 0,
  })).filter(r => r.gender);
}

// ---- Education ----
export async function loadEducation() {
  const rows = await loadCSV('dashboard_education.csv');
  return rows.map(r => ({
    level: (r.Education_Level || '').trim(),
    count: parseInt(r.Count, 10) || 0,
  })).filter(r => r.level);
}

// ---- Occupation ----
export async function loadOccupation() {
  const rows = await loadCSV('dashboard_occupation.csv');
  return rows.map(r => ({
    occupation: (r.Occupation || '').trim(),
    count: parseInt(r.Count, 10) || 0,
  })).filter(r => r.occupation);
}

// ---- Location ----
export async function loadLocation() {
  const rows = await loadCSV('dashboard_location.csv');
  return rows.map(r => ({
    location: (r.Location || '').trim(),
    count: parseInt(r.Count, 10) || 0,
  })).filter(r => r.location)
    .sort((a, b) => b.count - a.count);
}

// ---- Policy ----
export async function loadPolicy() {
  const rows = await loadCSV('dashboard_policy.csv');
  return rows.map(r => ({
    type: (r.Policy_Type || '').trim(),
    count: parseInt(r.Count, 10) || 0,
  })).filter(r => r.type);
}

// ---- Language ----
export async function loadLanguage() {
  const rows = await loadCSV('dashboard_language.csv');
  return rows.map(r => ({
    language: (r.Language || '').trim(),
    count: parseInt(r.Count, 10) || 0,
  })).filter(r => r.language);
}

// ---- Similarity Distribution ----
export async function loadSimilarity() {
  const rows = await loadCSV('dashboard_similarity.csv');
  return rows.map(r => ({
    range: (r.Similarity_Range || '').trim(),
    count: parseInt(r.Count, 10) || 0,
  })).filter(r => r.range && r.count > 0);
}

// ---- Duplicate Pairs ----
// Heavy: ~104k rows. Apply data quality rules:
//  1. Filter self-pairs (ID1 === ID2)
//  2. Deduplicate reverse pairs (keep canonical pair where ID1 < ID2)
//  3. Filter invalid scores (null, NaN, outside 0–1)
export async function loadDuplicatePairs() {
  const rows = await loadCSV('dashboard_duplicate_pairs.csv');

  const seen = new Set();
  const cleaned = [];

  for (const r of rows) {
    const id1 = (r.Customer_ID_1 || '').trim();
    const id2 = (r.Customer_ID_2 || '').trim();
    if (!id1 || !id2) continue;

    // Rule A: Remove self-pairs
    if (id1 === id2) continue;

    // Rule C: Validate similarity score
    const sim = parseFloat(r.Similarity_Score);
    if (isNaN(sim) || sim < 0 || sim > 1) continue;

    const cat = parseFloat(r.Categorical_Score);
    const num = parseFloat(r.Numeric_Score);

    // Rule B: Canonical pair key (lower id first, string comparison)
    const key = id1 < id2 ? `${id1}|${id2}` : `${id2}|${id1}`;
    if (seen.has(key)) continue;
    seen.add(key);

    cleaned.push({
      id1,
      id2,
      categoricalScore: isNaN(cat) ? null : cat,
      numericScore: isNaN(num) ? null : num,
      similarityScore: sim,
      status: (r.Duplicate_Status || '').trim(),
    });
  }

  // Sort by similarity descending
  cleaned.sort((a, b) => b.similarityScore - a.similarityScore);
  return cleaned;
}

// ---- Customer Data ----
// Large: ~52k rows. Returns raw rows — caller is responsible for pagination.
export async function loadCustomers() {
  const rows = await loadCSV('dashboard_customer_data.csv');
  return rows.map(r => ({
    id: (r['Customer ID'] || '').trim(),
    age: r.Age,
    gender: r.Gender,
    maritalStatus: r['Marital Status'],
    educationLevel: r['Education Level'],
    location: r['Geographic Information'],
    occupation: r.Occupation,
    incomeLevel: r['Income Level'],
    behavioralData: r['Behavioral Data'],
    purchaseHistory: r['Purchase History'],
    interactions: r['Interactions with Customer Service'],
    insuranceProducts: r['Insurance Products Owned'],
    coverageAmount: r['Coverage Amount'],
    premiumAmount: r['Premium Amount'],
    policyType: r['Policy Type'],
    customerPreferences: r['Customer Preferences'],
    preferredChannel: r['Preferred Communication Channel'],
    preferredContactTime: r['Preferred Contact Time'],
    preferredLanguage: r['Preferred Language'],
    segmentationGroup: r['Segmentation Group'],
    // Standardized fields
    genderStd: r['Gender_Standardized'],
    maritalStatusStd: r['Marital Status_Standardized'],
    educationStd: r['Education Level_Standardized'],
    locationStd: r['Geographic Information_Standardized'],
    occupationStd: r['Occupation_Standardized'],
    policyTypeStd: r['Policy Type_Standardized'],
    languageStd: r['Preferred Language_Standardized'],
    channelStd: r['Preferred Communication Channel_Standardized'],
    contactTimeStd: r['Preferred Contact Time_Standardized'],
    segmentationStd: r['Segmentation Group_Standardized'],
    ageStd: r['Age_Standardized'],
    incomeLevelStd: r['Income Level_Standardized'],
    coverageStd: r['Coverage Amount_Standardized'],
    premiumStd: r['Premium Amount_Standardized'],
    // Group/master info
    duplicateGroupId: r['Duplicate_Group_ID'],
    groupSize: r['Group_Size'],
    masterProfile: r['Master_Profile'],
    customerStatus: r['Customer_Status'],
    blockingKey: r['blocking_key'],
    missingAttributes: r['Missing_Attributes'],
    profileCompleteness: r['Profile_Completeness'],
  })).filter(r => r.id);
}
