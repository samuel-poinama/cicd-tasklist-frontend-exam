import '@testing-library/jest-dom';
import { vi } from 'vitest';

// CI agents are resource-constrained; v8 coverage instrumentation makes even
// trivial renders slow, so raise the default per-test/hook timeouts at runtime.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

