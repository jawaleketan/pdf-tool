/// <reference lib="webworker" />
import { startStubWorker } from '../lib/pdf/stubWorker';

// Compress ships in Release 3; this stub is replaced by the real engine then.
startStubWorker('compress');
