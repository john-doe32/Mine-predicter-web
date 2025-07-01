/** @jsx React.createElement */
/* Mine Predictor App - adapted for CDN React */
/* global React, ReactDOM */

const { useState, useEffect } = React;

// Helper: Convert ArrayBuffer to Hex String
const bufferToHex = (buffer) => {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
};

function App() {
    // State
    const [serverSeed, setServerSeed] = useState('');
    const [clientSeed, setClientSeed] = useState('');
    const [nonce, setNonce] = useState(0);
    const [hashAlgorithm, setHashAlgorithm] = useState('SHA-256');
    const [numMines, setNumMines] = useState(1);

    const [combinedString, setCombinedString] = useState('');
    const [calculatedHash, setCalculatedHash] = useState('');
    const [largeDecimalNumber, setLargeDecimalNumber] = useState('');
    const [minePositions, setMinePositions] = useState([]);
    const [message, setMessage] = useState('');

    // Calculate Mines
    const calculateMines = async () => {
        setMessage('');
        setMinePositions([]);

        if (!serverSeed || !clientSeed) {
            setMessage('Please enter both Server Seed and Client Seed.');
            return;
        }

        // Combine inputs
        const combined = `${serverSeed}${clientSeed}:${nonce}`;
        setCombinedString(combined);

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(combined);
            let hashBuffer;

            if (hashAlgorithm === 'SHA-256') {
                hashBuffer = await crypto.subtle.digest('SHA-256', data);
            } else if (hashAlgorithm === 'SHA-512') {
                hashBuffer = await crypto.subtle.digest('SHA-512', data);
            } else {
                setMessage('Invalid hashing algorithm selected.');
                return;
            }

            const hashResult = bufferToHex(hashBuffer);
            setCalculatedHash(hashResult);

            const bigIntHash = BigInt(`0x${hashResult}`);
            setLargeDecimalNumber(bigIntHash.toString());

            // Determine mine positions – placeholder logic
            const boardSize = 25;
            const predictedMines = [];
            const availablePositions = Array.from({ length: boardSize }, (_, i) => i);
            let hashIndex = 0;

            while (predictedMines.length < numMines && hashIndex < hashResult.length) {
                const chunk = hashResult.substring(hashIndex, hashIndex + 8);
                if (chunk.length < 8) {
                    setMessage("Not enough unique hash data to generate all mine positions with current logic.");
                    break;
                }
                const chunkDecimal = BigInt(`0x${chunk}`);
                const idxInAvail = Number(chunkDecimal % BigInt(availablePositions.length));
                const mineIdx = availablePositions[idxInAvail];

                predictedMines.push(mineIdx);
                availablePositions.splice(idxInAvail, 1);
                hashIndex += 8;
            }

            if (predictedMines.length < numMines) {
                setMessage("Could not generate enough unique mine positions. Please verify your game's exact algorithm.");
            }

            setMinePositions(predictedMines.sort((a, b) => a - b));
            if (!message) setMessage("Prediction complete! Remember, mine placement logic is a placeholder – adapt to your game's exact rules.");
        } catch (error) {
            setMessage(`Error: ${error.message}. Check inputs or browser compatibility.`);
            console.error(error);
        }
    };

    // Render grid
    const renderGrid = () => {
        const cells = [];
        for (let i = 0; i < 25; i++) {
            const isMine = minePositions.includes(i);
            cells.push(
                <div
                    key={i}
                    className={\`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border border-gray-600 rounded-md shadow-sm \${isMine ? 'bg-red-500 text-white font-bold' : 'bg-gray-700 text-gray-300'} transition-colors duration-200\`}
                >
                    {isMine ? '💣' : i}
                </div>
            );
        }
        return (
            <div className="grid grid-cols-5 gap-2 p-4 bg-gray-800 rounded-lg shadow-inner">
                {cells}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-inter flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-green-400 mb-6 text-center">Mine Predictor</h1>

            {/* Input Card */}
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="mb-4">
                    <label htmlFor="serverSeed" className="block text-sm font-medium text-gray-300 mb-1">Server Seed</label>
                    <input
                        type="text"
                        id="serverSeed"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                        value={serverSeed}
                        onChange={(e) => setServerSeed(e.target.value)}
                        placeholder="Enter server seed"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="clientSeed" className="block text-sm font-medium text-gray-300 mb-1">Client Seed</label>
                    <input
                        type="text"
                        id="clientSeed"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                        value={clientSeed}
                        onChange={(e) => setClientSeed(e.target.value)}
                        placeholder="Enter client seed"
                    />
                </div>
                <div className="mb-4 flex space-x-4">
                    <div className="flex-1">
                        <label htmlFor="nonce" className="block text-sm font-medium text-gray-300 mb-1">Nonce</label>
                        <input
                            type="number"
                            id="nonce"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                            value={nonce}
                            onChange={(e) => setNonce(Number(e.target.value))}
                            min="0"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="hashAlgorithm" className="block text-sm font-medium text-gray-300 mb-1">Hash Algorithm</label>
                        <select
                            id="hashAlgorithm"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                            value={hashAlgorithm}
                            onChange={(e) => setHashAlgorithm(e.target.value)}
                        >
                            <option value="SHA-256">SHA-256</option>
                            <option value="SHA-512">SHA-512</option>
                        </select>
                    </div>
                </div>
                <div className="mb-6">
                    <label htmlFor="numMines" className="block text-sm font-medium text-gray-300 mb-1">Number of Mines (5x5 board)</label>
                    <input
                        type="number"
                        id="numMines"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                        value={numMines}
                        onChange={(e) => setNumMines(Math.max(1, Math.min(24, Number(e.target.value))))}
                        min="1"
                        max="24"
                    />
                </div>

                <button
                    onClick={calculateMines}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors duration-200"
                >
                    Predict Mines
                </button>

                {message && (
                    <div className="mt-4 p-3 bg-yellow-800 text-yellow-200 rounded-md text-sm">
                        {message}
                    </div>
                )}
            </div>

            {/* Hash details */}
            {calculatedHash && (
                <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-green-300 mb-4">Calculation Steps</h2>
                    <div className="text-sm break-all mb-3">
                        <p className="font-medium text-gray-400">Combined String (ServerSeed + ClientSeed + : + Nonce):</p>
                        <p className="text-gray-200">{combinedString}</p>
                    </div>
                    <div className="text-sm break-all mb-3">
                        <p className="font-medium text-gray-400">Calculated Hash ({hashAlgorithm}):</p>
                        <p className="text-gray-200">{calculatedHash}</p>
                    </div>
                    <div className="text-sm break-all mb-3">
                        <p className="font-medium text-gray-400">Large Decimal Number:</p>
                        <p className="text-gray-200">{largeDecimalNumber}</p>
                    </div>
                </div>
            )}

            {/* Mine grid */}
            {minePositions.length > 0 && (
                <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-green-300 mb-4 text-center">Predicted Mine Locations (5x5 Grid)</h2>
                    {renderGrid()}
                    <p className="mt-4 text-center text-sm text-gray-400">
                        Mine(s) at 0-indexed positions: <span className="font-bold text-red-400">{minePositions.join(', ')}</span>
                    </p>
                    <p className="mt-2 p-2 bg-blue-900 text-blue-200 rounded-md text-xs text-center">
                        **IMPORTANT:** The exact mine placement logic is a placeholder. Update this algorithm to match your game's rules for production use!
                    </p>
                </div>
            )}
        </div>
    );
}

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />);