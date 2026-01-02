import React, { useState, useCallback } from 'react';
import { SearchableSelect, Option } from './searchable-select';

// Mock data generator
const generateMockOptions = (start: number, count: number): Option[] => {
  return Array.from({ length: count }, (_, i) => ({
    value: `option-${start + i}`,
    label: `Option ${start + i + 1}`
  }));
};

const SearchableSelectExample: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [options, setOptions] = useState<Option[]>(() => generateMockOptions(0, 10));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newOptions = generateMockOptions(options.length, 10);
    setOptions(prev => [...prev, ...newOptions]);
    
    // Simulate end of data after 50 items
    if (options.length >= 40) {
      setHasMore(false);
    }
    
    setLoading(false);
  }, [loading, options.length]);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <label className="block text-sm font-medium mb-2">
        Select an option:
      </label>
      <SearchableSelect
        options={options}
        value={selectedValue}
        onValueChange={setSelectedValue}
        placeholder="Choose an option..."
        searchPlaceholder="Search options..."
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
      />
      
      {selectedValue && (
        <p className="mt-4 text-sm text-gray-600">
          Selected: {options.find(opt => opt.value === selectedValue)?.label}
        </p>
      )}
    </div>
  );
};

export default SearchableSelectExample;