/// <reference lib="webworker" />
import { startStubWorker } from '../lib/pdf/stubWorker';

// Merge ships in Release 1; this stub is replaced by the real pdf-lib engine then.
startStubWorker('merge');
