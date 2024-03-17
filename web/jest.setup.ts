import '@testing-library/jest-dom'

// mock structuredClone as it does not yet exist in jest-dom
// https://stackoverflow.com/a/76729230/1940886
global.structuredClone = v => JSON.parse(JSON.stringify(v));

HTMLCanvasElement.prototype.getContext = jest.fn();