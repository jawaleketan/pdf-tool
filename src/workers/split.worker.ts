/// <reference lib="webworker" />
import { startStubWorker } from '../lib/pdf/stubWorker';

// Split ships in Release 2; this stub is replaced by the real pdf-lib engine then.
startStubWorker('split');
