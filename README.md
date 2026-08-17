# Social Media Profile Data Deduplication & Standardization

## Problem Statement
User registration systems can contain redundant profiles created by the same person using variations in profile attributes. This leads to inflated profile counts, inaccurate analytics, and inefficient customer management.

## Objectives
The project goal is to design and demonstrate a data deduplication and standardization pipeline that:
1. Identifies potential duplicate user/customer profiles.
2. Uses similarity-based matching.
3. Groups potential duplicate profiles.
4. Identifies master profiles.
5. Standardizes profile attributes.
6. Presents the results through a professional, interactive web dashboard.

## Dataset Description
The dataset contains over 50,000 customer profile records with various attributes including demographics, financial data, and policy information.

## Deduplication Methodology
1.  **Data Cleaning:** Handling missing values and whitespace.
2.  **Standardization:** Lowercase normalization and category mapping.
3.  **Blocking:** Generating a blocking key to reduce the number of pairwise comparisons.
4.  **Similarity Scoring:** Calculating categorical and numeric similarity between pairs.
5.  **Duplicate Grouping:** Clustering high-similarity pairs into groups.
6.  **Master Profile Selection:** Identifying the most complete record in each group.

## Standardization Methodology
Profiles are standardized to ensure consistent comparison. This includes:
-   Lowercase conversion for text fields.
-   Category mapping.
-   Numeric normalization (scaling to 0-1 range).

## Technology Stack
-   **Frontend:** React, Vite, JavaScript
-   **Styling:** Custom CSS with CSS Variables
-   **Charts:** Recharts
-   **Icons:** Lucide React
-   **Data Parsing:** PapaParse
-   **Data Processing (Pipeline):** Python, Pandas, Fuzzy matching

## Folder Structure
```
SocialMediaDeduplication/
├── data/                      # Original CSV files
├── public/
│   └── data/                  # CSV files served by Vite
├── src/
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Dashboard pages
│   ├── services/              # Data loading logic
│   └── utils/                 # Formatting and helpers
├── index.html
├── package.json
├── setup.js                   # Script to copy CSVs to public/data
├── vite.config.js
└── README.md
```

## How to Install
1.  Ensure Node.js is installed.
2.  Navigate to the project directory: `cd SocialMediaDeduplication`
3.  Install dependencies: `npm install`

## How to Run
1.  Start the development server: `npm run dev`
    *(This will automatically run `node setup.js` to copy data files, then start Vite)*
2.  Open the provided local URL (usually `http://localhost:3000`) in your browser.

## Dashboard Features
-   **Overview:** High-level KPIs and distribution charts.
-   **Duplicate Detection:** Searchable and filterable table of potential duplicate pairs with a detailed side-by-side comparison modal.
-   **Customer Profiles:** Paginated directory of all customer records with a detailed profile view.
-   **Standardization:** Visual explanation of the pipeline, before/after examples, and completeness metrics.
-   **Analytics:** Interactive charts exploring demographic and policy distributions.
-   **Data Quality:** Metrics on profile completeness, missing attributes, and known data discrepancies.
-   **About:** Project context and methodology.

## Limitations
-   Results represent potential duplicates; identity verification is not guaranteed as direct personal identifiers are absent.
-   There is a known discrepancy between the total profiles reported in `dashboard_kpis.csv` (53,503) and the number of rows in `dashboard_customer_data.csv` (52,396).

## Future Enhancements
-   Implement server-side pagination for extremely large datasets.
-   Integrate real-time deduplication pipeline scoring.
-   Add user feedback mechanism to confirm/reject duplicate pairs.
