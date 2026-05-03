import React, { useState, useEffect, useRef } from 'react';
import './SearchableDropdown.css';

function useDebounce(value, delay = 200) {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

const OptionItem = React.memo(({ option, isSelected, isHighlighted, onClick }) => (
    <li
        className={`option-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'focused' : ''}`}
        role="option"
        aria-selected={isSelected}
        onClick={onClick}
    >
        <svg className="check-icon" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div className="option-content">
            <span className="option-title">{option.title}</span>
            {option.subtitle && <span className="option-subtitle">{option.subtitle}</span>}
        </div>
    </li>
));

const SearchableDropdown = ({
    options,
    value,
    onChange,
    placeholder = "Choose an option...",
    label,
    id
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 200);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Create refs
    const wrapperRef = useRef(null);
    const searchInputRef = useRef(null);
    const optionsListRef = useRef(null);

    // Derived state with advanced search scoring
    const filteredOptions = React.useMemo(() => {
        if (!debouncedSearch.trim()) return options;

        const query = debouncedSearch.toLowerCase().trim();
        const terms = query.split(/\s+/); // Split by space to support multi-word disjoint searches

        // Score 100: Exact match on title
        // Score 80: Title starts with the exact query
        // Score 60: Query matches the start of a word in the title
        // Score 40: Title contains the exact query anywhere
        // Score 20: Fallback (all terms found, but disjointed or in subtitle)
        const scoredOptions = options.map(option => {
            const title = String(option.title || '').toLowerCase();
            const subtitle = String(option.subtitle || '').toLowerCase();
            const searchTarget = `${title} ${subtitle}`;

            // Fast fail: must contain all search terms anywhere in the object
            const matchesAllTerms = terms.every(term => searchTarget.includes(term));
            if (!matchesAllTerms) return { option, score: -1 };

            let score = 0;
            if (title === query) {
                score = 100;
            } else if (title.startsWith(query)) {
                score = 80;
            } else if (title.includes(` ${query}`) || title.includes(`(${query}`) || title.includes(`-${query}`)) {
                score = 60;
            } else if (title.includes(query)) {
                score = 40;
            } else {
                score = 20;
            }

            return { option, score };
        });

        // Filter out non-matches, sort by score descending, then map back to objects
        return scoredOptions
            .filter(item => item.score > -1)
            .sort((a, b) => b.score - a.score)
            .map(item => item.option);

    }, [options, debouncedSearch]);

    const suggestedOptions = React.useMemo(() => {
        if (!debouncedSearch.trim()) return [];

        const q = debouncedSearch.toLowerCase().trim();

        return options
            .map(opt => {
                const text = `${opt.title} ${opt.subtitle || ''}`.toLowerCase();

                let score = 0;
                // Exact match gets highest priority
                if (text.includes(q)) score += 10;

                const words = q.split(/\s+/).filter(Boolean);
                words.forEach(w => {
                    // Whole word match within text
                    if (text.includes(w)) {
                        score += 5;
                    } else if (w.length > 2) {
                        // Poor man's fuzzy match: check for 3-letter chunks inside the text
                        // Handles minor typos like "buidling" -> "bui", "idl", "ing" 
                        for (let i = 0; i <= w.length - 3; i++) {
                            if (text.includes(w.substring(i, i + 3))) {
                                score += 1;
                            }
                        }
                    }
                });

                return { opt, score };
            })
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(x => x.opt);

    }, [debouncedSearch, options]);

    const selectedOption = options.find(opt => opt.id === value || opt.actualValue === value);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
            setSearchTerm('');
            setHighlightedIndex(-1);
        }
    }, [isOpen]);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSelect = (option) => {
        onChange(option.actualValue !== undefined ? option.actualValue : option.id);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'Escape') {
            setIsOpen(false);
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => {
                const newIndex = (prev + 1) % filteredOptions.length;
                scrollToHighlight(newIndex);
                return newIndex;
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => {
                const newIndex = (prev - 1 + filteredOptions.length) % filteredOptions.length;
                scrollToHighlight(newIndex);
                return newIndex;
            });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                handleSelect(filteredOptions[highlightedIndex]);
            }
        }
    };

    const scrollToHighlight = (index) => {
        if (!optionsListRef.current) return;
        const items = optionsListRef.current.querySelectorAll('.option-item');
        if (items[index]) {
            items[index].scrollIntoView({ block: 'nearest' });
        }
    };

    return (
        <div className={`dropdown-wrapper ${isOpen ? 'open' : ''}`} ref={wrapperRef} id={id ? `${id}-wrapper` : undefined}>
            {label && <label className="label" htmlFor={id || "dropdown-trigger"}>{label}</label>}

            <button
                type="button"
                className="dropdown-trigger form-select-sm"
                id={id || "dropdown-trigger"}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={`selected-text ${(!selectedOption || !value) ? 'dropdown-placeholder' : ''}`}>
                    {(selectedOption && value) ? selectedOption.title : placeholder}
                </span>
                <svg className="arrow-icon" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </button>

            <div className="dropdown-menu">
                <div className="search-container">
                    <input
                        type="search"
                        name={`search-${id || ''}-${Math.random().toString(36).substring(7)}`}
                        className="search-input"
                        ref={searchInputRef}
                        placeholder="Search options..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="new-password"
                        autoCorrect="off"
                        spellCheck="false"
                        role="combobox"
                        aria-autocomplete="none"
                    />
                </div>

                <ul className="options-list" ref={optionsListRef} role="listbox">
                    {filteredOptions.length === 0 ? (
                        <div className="p-3">
                            <div className="text-center mb-2 mt-1">
                                <div className="text-muted fw-bold mb-1">No results found</div>
                                <div className="small text-secondary" style={{ wordBreak: 'break-word' }}>
                                    We couldn't find anything matching "{debouncedSearch}".
                                </div>
                            </div>

                            {suggestedOptions.length > 0 && (
                                <div className="text-start mt-3 pt-3 border-top border-secondary-subtle">
                                    <div className="small fw-bold text-muted mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Did you mean...
                                    </div>
                                    <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                                        {suggestedOptions.map((opt, index) => (
                                            <li
                                                key={`suggest-${opt.id || index}`}
                                                className="p-2 rounded-2"
                                                onClick={() => handleSelect(opt)}
                                                style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', transition: 'background-color 0.2s' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e9ecef'; e.currentTarget.style.borderColor = '#ced4da'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.borderColor = '#dee2e6'; }}
                                            >
                                                <div className="small fw-medium text-primary">{opt.title}</div>
                                                {opt.subtitle && <div className="text-muted mt-1" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>{opt.subtitle}</div>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        filteredOptions.map((option, index) => {
                            const isSelected = option.id === value;
                            const isHighlighted = index === highlightedIndex;

                            return (
                                <OptionItem
                                    key={option.id || index}
                                    option={option}
                                    isSelected={isSelected}
                                    isHighlighted={isHighlighted}
                                    onClick={() => handleSelect(option)}
                                />
                            );
                        })
                    )}
                </ul>
            </div>
        </div>
    );
};

export default SearchableDropdown;
