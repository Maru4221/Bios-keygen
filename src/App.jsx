import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Key, Search, Copy, Check, Info, Cpu, MousePointer2 } from 'lucide-react';
import { keygen } from './lib/keygen';

function App() {
  const [serial, setSerial] = useState('');
  const [results, setResults] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (serial.trim()) {
      const found = keygen(serial);
      setResults(found);
    } else {
      setResults([]);
    }
  }, [serial]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const examples = [
    "1234567-595B",
    "A7AF422F",
    "20100203",
    "CNU1234ABC",
    "03133610",
    "73KR-3FP9-PVKH-K29R"
  ];

  return (
    <div className="container">
      <header>
        <h1>BIOS MASTER KEY</h1>
        <p className="subtitle">Universal Master Password Generator for BIOS/UEFI</p>
      </header>

      <main>
        <div className="card input-section">
          <div className="input-group">
            <label htmlFor="serial-input">Enter Serial or Service Tag</label>
            <div className="input-wrapper">
              <input
                id="serial-input"
                type="text"
                placeholder="e.g. 1234567-595B"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
              <Search className="search-icon" size={20} />
            </div>
          </div>

          <div className="examples">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '8px', alignSelf: 'center' }}>
              Try these:
            </span>
            {examples.map((ex) => (
              <span
                key={ex}
                className="example-tag"
                onClick={() => setSerial(ex)}
              >
                {ex}
              </span>
            ))}
          </div>
        </div>

        <div className="results-container">
          {results.length > 0 ? (
            <div className="results-grid">
              {results.map((result, idx) => (
                <div key={idx} className="card result-card">
                  <div className="result-header">
                    <span className="bios-name">
                      {result.solver.biosName}
                    </span>
                    <Info size={16} className="info-icon" title={result.solver.description} />
                  </div>

                  <div className="passwords-list">
                    {result.passwords.map((pw, pidx) => {
                      const id = `${idx}-${pidx}`;
                      return (
                        <div
                          key={pidx}
                          className="password-item"
                          onClick={() => handleCopy(pw, id)}
                        >
                          <span className="password-text">{pw}</span>
                          {copiedId === id ? (
                            <Check size={16} color="var(--accent-color)" />
                          ) : (
                            <Copy size={16} className="copy-icon" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="result-footer">
                    <span className="calc-time">
                      Computed in {result.calcTime.toFixed(2)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            serial.trim() && (
              <div className="card no-results">
                <Shield size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                <p>No master passwords found for this input.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                  Make sure you entered the correct code as displayed on the BIOS screen.
                </p>
              </div>
            )
          )}
        </div>
      </main>

      <footer>
        <p>© 2026 BIOS Master Key - Powered by reverse engineering research</p>
        <p style={{ marginTop: '4px' }}>Ported from bios-pw.org logic</p>
      </footer>
    </div>
  );
}

export default App;
