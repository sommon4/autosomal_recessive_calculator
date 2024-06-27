// src/AutosomalRecessiveGeneticCalculator.js

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4ade80', '#fbbf24', '#f87171'];

const getFraction = (decimal) => {
  if (decimal === 0) return '0';
  if (decimal === 1) return '1';
  const tolerance = 1.0E-6;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = decimal;
  do {
    let a = Math.floor(b);
    let aux = h1; h1 = a * h1 + h2; h2 = aux;
    aux = k1; k1 = a * k1 + k2; k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
  return `${h1}/${k1}`;
};

const parseFraction = (fraction) => {
  const [numerator, denominator] = fraction.split('/').map(Number);
  return numerator / denominator;
};

const AutosomalRecessiveGeneticCalculator = () => {
  const [inputType, setInputType] = useState('percentage');
  const [parentCarrierProbability, setParentCarrierProbability] = useState(25);
  const [parentCarrierFraction, setParentCarrierFraction] = useState('1/4');
  const [outcomes, setOutcomes] = useState({ normal: 0, carrier: 0, affected: 0 });

  useEffect(() => {
    calculateOutcomes();
  }, [parentCarrierProbability, parentCarrierFraction, inputType]);

  const calculateOutcomes = () => {
    const p = inputType === 'percentage' ? parentCarrierProbability / 100 : parseFraction(parentCarrierFraction);
    const q = 1 - p;

    const probabilityBothCarriers = p * p;
    const probabilityOneCarrier = 2 * p * q;

    const affectedProbability = probabilityBothCarriers * 0.25;
    const carrierProbability = (probabilityBothCarriers * 0.5) + (probabilityOneCarrier * 0.5);
    const normalProbability = 1 - affectedProbability - carrierProbability;

    setOutcomes({
      normal: normalProbability,
      carrier: carrierProbability,
      affected: affectedProbability,
    });
  };

  const handleInputChange = (value) => {
    if (inputType === 'percentage') {
      setParentCarrierProbability(Number(value));
    } else {
      setParentCarrierFraction(value);
    }
  };

  const data = [
    { name: 'Normal', value: outcomes.normal },
    { name: 'Carrier', value: outcomes.carrier },
    { name: 'Affected', value: outcomes.affected },
  ];

  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Autosomal Recessive Genetic Calculator</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Input Type:</label>
        <select 
          value={inputType} 
          onChange={(e) => setInputType(e.target.value)}
          className="mb-2 p-2 rounded"
        >
          <option value="percentage">Percentage</option>
          <option value="fraction">Fraction</option>
        </select>
        
        {inputType === 'percentage' ? (
          <div>
            <label className="block mb-2">Parent Carrier Probability: {parentCarrierProbability}% (p = {getFraction(parentCarrierProbability/100)})</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={parentCarrierProbability} 
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full"
            />
          </div>
        ) : (
          <div>
            <label className="block mb-2">Parent Carrier Fraction: (p = {parentCarrierFraction})</label>
            <input 
              type="text" 
              value={parentCarrierFraction} 
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full p-2 rounded"
              placeholder="Enter fraction (e.g., 1/4)"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-bold">Outcomes:</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${(value * 100).toFixed(2)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <p>Normal: {(outcomes.normal * 100).toFixed(2)}% = {getFraction(outcomes.normal)}</p>
        <p>Carrier: {(outcomes.carrier * 100).toFixed(2)}% = {getFraction(outcomes.carrier)}</p>
        <p>Affected: {(outcomes.affected * 100).toFixed(2)}% = {getFraction(outcomes.affected)}</p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="font-bold mb-2">Calculations and Equations (Autosomal Recessive):</h3>
        <p>p = probability of parent being a carrier = {inputType === 'percentage' ? getFraction(parentCarrierProbability/100) : parentCarrierFraction}</p>
        <p>q = probability of parent not being a carrier = 1 - p = {getFraction(1 - (inputType === 'percentage' ? parentCarrierProbability/100 : parseFraction(parentCarrierFraction)))}</p>
        <p>1. Probability of both parents being carriers: p² = {getFraction(Math.pow(inputType === 'percentage' ? parentCarrierProbability/100 : parseFraction(parentCarrierFraction), 2))}</p>
        <p>2. Probability of only one parent being a carrier: 2pq = {getFraction(2 * (inputType === 'percentage' ? parentCarrierProbability/100 : parseFraction(parentCarrierFraction)) * (1 - (inputType === 'percentage' ? parentCarrierProbability/100 : parseFraction(parentCarrierFraction))))}</p>
        <p>3. Probability of no parents being carriers: q² = {getFraction(Math.pow(1 - (inputType === 'percentage' ? parentCarrierProbability/100 : parseFraction(parentCarrierFraction)), 2))}</p>
        <p>4. Probability of affected child: p² × 1/4 = {getFraction(outcomes.affected)}</p>
        <p>5. Probability of carrier child: (p² × 1/2) + (2pq × 1/2) = {getFraction(outcomes.carrier)}</p>
        <p>6. Probability of normal child: 1 - (affected + carrier) = {getFraction(outcomes.normal)}</p>
      </div>
    </div>
  );
};

export default AutosomalRecessiveGeneticCalculator;
