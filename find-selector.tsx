import React from 'react';
import { renderToString } from 'react-dom/server';
import { Billing } from './src/pages/Billing';

// Mock firebase
jest.mock('firebase/firestore', () => ({}));
jest.mock('./src/lib/auth', () => ({}));

console.log(renderToString(<Billing embedded={true} />));
