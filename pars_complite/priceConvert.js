
const fs = require('fs').promises;

const USD_TO_UAH_RATE = 41.5; // Example rate, adjust based on current exchange rate

// Helper function to round to 2 decimal places
const roundToTwo = (num) => Number(num.toFixed(2));

async function processJsonFile(inputFilePath, outputFilePath) {
    try {
        // 1. Read the JSON file
        const rawData = await fs.readFile(inputFilePath, 'utf8');
        const data = JSON.parse(rawData);

        // 2. Process each object in the array
        const processedData = data.map(item => {
            // Step 1: Calculate prices with 20% increase and round
            const initial20 = roundToTwo(item.prices.initialPrice * 1.23);
            const current20 = roundToTwo(item.prices.currentPrice * 1.23);

            // Step 2: Add selfprices structure
            const withSelfPrices = {
                ...item,
                self: {
                    initial20: initial20,
                    current20: current20
                }
            };

            // Step 3: Add UAH conversion and round
            return {
                ...withSelfPrices,
                UAH: {
                    initialPrice: roundToTwo(item.prices.initialPrice * USD_TO_UAH_RATE),
                    currentPrice: roundToTwo(item.prices.currentPrice * USD_TO_UAH_RATE)
                },
                selfUAH: {
                    initial20: roundToTwo(initial20 * USD_TO_UAH_RATE),
                    current20: roundToTwo(current20 * USD_TO_UAH_RATE)
                }
            };
        });

        // 4. Save to new file
        await fs.writeFile(
            outputFilePath,
            JSON.stringify(processedData, null, 2),
            'utf8'
        );
        
        console.log('File has been processed and saved successfully');
        return processedData;

    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
}

// Example usage
const inputFile = '../JSON/b1f3_nike_prices.json'; // Path to your input JSON file
const outputFile = '../JSON/b1f5_nike_prices_converted.json'; // Path to your output JSON file
processJsonFile(inputFile, outputFile)
    .then(() => console.log('Processing complete'))
    .catch(err => console.error('Failed to process file:', err));
