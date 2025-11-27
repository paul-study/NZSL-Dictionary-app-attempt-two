// Generate Sign Index Script
// Run this with Node.js to create a pre-built index file for faster loading

const fs = require('fs');
const path = require('path');

const dataDir = './data';
const outputFile = './signs-index.json';

function generateIndex() {
    const signs = {};
    const signIndex = {};
    
    // Read all JSON files in the data directory
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    
    console.log(`Found ${files.length} sign files`);
    
    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const id = data.nzsl_id;
            
            signs[id] = data;
            
            // Index by English words
            if (data.gloss && data.gloss.english) {
                data.gloss.english.forEach(word => {
                    const normalizedWord = word.toLowerCase().trim();
                    if (normalizedWord) {
                        if (!signIndex[normalizedWord]) {
                            signIndex[normalizedWord] = [];
                        }
                        if (!signIndex[normalizedWord].includes(id)) {
                            signIndex[normalizedWord].push(id);
                        }
                    }
                });
            }
            
            // Also index secondary English words
            if (data.gloss && data.gloss.english_secondary) {
                data.gloss.english_secondary.forEach(word => {
                    if (word && word.trim()) {
                        const normalizedWord = word.toLowerCase().trim();
                        if (!signIndex[normalizedWord]) {
                            signIndex[normalizedWord] = [];
                        }
                        if (!signIndex[normalizedWord].includes(id)) {
                            signIndex[normalizedWord].push(id);
                        }
                    }
                });
            }
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
        }
    });
    
    // Create the combined index file
    const indexData = {
        signs: signs,
        index: signIndex,
        generatedAt: new Date().toISOString(),
        totalSigns: Object.keys(signs).length,
        totalWords: Object.keys(signIndex).length
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(indexData));
    
    console.log(`Generated index with ${indexData.totalSigns} signs and ${indexData.totalWords} indexed words`);
    console.log(`Output saved to ${outputFile}`);
}

generateIndex();
