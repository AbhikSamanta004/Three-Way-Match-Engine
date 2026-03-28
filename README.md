# Three-Way Matching Engine (Backend)

## My Approach
I chose **Node.js** and **Express** for the server, and **MongoDB** for the database.
The main challenge was making sure the system didn't break if files were uploaded out of order. Instead of a strict Step 1 -> Step 2 setup, it will re-check the match every time a new document is added.

## Data Model
I kept it straightforward with 4 main collections in Mongo:
1. **PO**
2. **GRN**
3. **Invoice**
4. **MatchStatus**
Everything is linked by a unique `poNumber`.

## Parsing Flow
I used the **Gemini 2.5 Flash** API. 
- When you upload a file, I send its content to Gemini.
- I use a specific prompt to tell Gemini: "Look for the poNumber, date, and item items (code, qty) and give it back in clean JSON."
- Gemini returns the data in JSON format.

## Matching Logic

Matching is done at the **item level** using `itemCode` as the common key between PO, GRN, and Invoice.
For each item, the system performs these checks:

- GRN quantity should not be greater than PO quantity  
- Invoice quantity should not be greater than total GRN quantity  
- Invoice quantity should not be greater than PO quantity  
- Invoice date should not be after PO date  

### Status Rules

- If all checks pass → `matched`  
- If some documents are missing → `insufficient_documents`  
- If any rule fails → `mismatch` (with reasons)  
- If some items match and some fail → `partially_matched`  

## Handling Out-of-Order Uploads
If an Invoice arrives before the PO, the system simply stores it. Once the PO is uploaded, the system triggers the matching logic, finds the waiting Invoice, and matches them. I run the matching service on every successfully parsed upload.

## Assumptions
- Every document (PO, GRN, INV) has a `poNumber` printed clearly on it.
- `itemCode` is the same across all three documents.
- The documents are either PDFs or clear images that Gemini can read.

## Tradeoffs
- **Gemini vs. Tesseract**: I used Gemini because it handles messy layouts better, but it's an external API call which adds a bit of latency.
- **On-the-fly vs. Scheduled**: I decided to re-match on every upload. It's great for accuracy, but if there were millions of documents, I'd probably need to move this to a background job system (like BullMQ).

## What I’d Improve (with more time)

- Add better handling for cases where `itemCode` is missing or not extracted properly
- Add more validation and error handling for incorrect or incomplete document data
- Improve Gemini parsing accuracy by refining prompts and response cleaning

### Setup
1. `npm install`
2. Add your `GEMINI_API_KEY` to `.env`.
3. `node src/server.js` or `npm run dev`