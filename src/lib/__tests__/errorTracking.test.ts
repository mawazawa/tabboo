import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { errorTracker, LogLevel, logDebug, logInfo, logWarn, logError, trackAction } from '../errorTracking';

describe('errorTracking', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    errorTracker.clearLogs();
  });

  describe('ErrorTracker', () => {
    describe('log', () => {
      it('should log with correct level and message', () => {
        const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        errorTracker.log(LogLevel.INFO, 'Test message');

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          '[INFO]',
          'Test message',
          ''
        );

        consoleInfoSpy.mockRestore();
      });

      it('should include context in logs', () => {
        const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        errorTracker.log(LogLevel.INFO, 'Test message', {
          userId: '123',
          page: 'home',
        });

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          '[INFO]',
          'Test message',
          expect.objectContaining({
            userId: '123',
            page: 'home',
          })
        );

        consoleInfoSpy.mockRestore();
      });

      it('should store logs in sessionStorage', () => {
        errorTracker.log(LogLevel.INFO, 'Test message');

        const logs = errorTracker.getLogs();
        expect(logs).toHaveLength(1);
        expect(logs[0]).toMatchObject({
          level: LogLevel.INFO,
          message: 'Test message',
        });
      });

      it('should include sessionId in all logs', () => {
        errorTracker.log(LogLevel.INFO, 'Message 1');
        errorTracker.log(LogLevel.WARN, 'Message 2');

        const logs = errorTracker.getLogs();
        expect(logs[0]).toHaveProperty('sessionId');
        expect(logs[1]).toHaveProperty('sessionId');
        expect(logs[0].sessionId).toBe(logs[1].sessionId); // Same session
      });

      it('should include timestamp in logs', () => {
        errorTracker.log(LogLevel.INFO, 'Test message');

        const logs = errorTracker.getLogs();
        expect(logs[0]).toHaveProperty('timestamp');
        expect(typeof logs[0].timestamp).toBe('string');
      });
    });

    describe('debug', () => {
      it('should log at DEBUG level', () => {
        const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

        errorTracker.debug('Debug message');

        expect(consoleDebugSpy).toHaveBeenCalledWith(
          '[DEBUG]',
          'Debug message',
          ''
        );

        consoleDebugSpy.mockRestore();
      });

      it('should accept context', () => {
        const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

        errorTracker.debug('Debug message', { key: 'value' });

        expect(consoleDebugSpy).toHaveBeenCalledWith(
          '[DEBUG]',
          'Debug message',
          expect.objectContaining({ key: 'value' })
        );

        consoleDebugSpy.mockRestore();
      });
    });

    describe('info', () => {
      it('should log at INFO level', () => {
        const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        errorTracker.info('Info message');

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          '[INFO]',
          'Info message',
          ''
        );

        consoleInfoSpy.mockRestore();
      });
    });

    describe('warn', () => {
      it('should log at WARN level', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        errorTracker.warn('Warning message');

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[WARN]',
          'Warning message',
          ''
        );

        consoleWarnSpy.mockRestore();
      });
    });

    describe('error', () => {
      it('should log at ERROR level', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        errorTracker.error('Error message');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[ERROR]',
          'Error message',
          expect.objectContaining({})
        );

        consoleErrorSpy.mockRestore();
      });

      it('should include error details when error object provided', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Test error');

        errorTracker.error('Something went wrong', error);

        const logs = errorTracker.getLogs();
        expect(logs[0]).toHaveProperty('error');
        expect(logs[0].error).toMatchObject({
          name: 'Error',
          message: 'Test error',
          stack: expect.any(String),
        });

        consoleErrorSpy.mockRestore();
      });

      it('should work without error object', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        errorTracker.error('Error without object');

        const logs = errorTracker.getLogs();
        expect(logs[0]).toMatchObject({
          level: LogLevel.ERROR,
          message: 'Error without object',
        });

        consoleErrorSpy.mockRestore();
      });
    });

    describe('trackAction', () => {
      it('should track user actions', () => {
        const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        errorTracker.trackAction('button_click', { buttonId: 'submit' });

        const logs = errorTracker.getLogs();
        expect(logs[0]).toMatchObject({
          level: LogLevel.INFO,
          message: 'User action: button_click',
          action: 'button_click',
          buttonId: 'submit',
        });

        consoleInfoSpy.mockRestore();
      });

      it('should work without details', () => {
        const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        errorTracker.trackAction('page_view');

        const logs = errorTracker.getLogs();
        expect(logs[0]).toMatchObject({
          message: 'User action: page_view',
          action: 'page_view',
        });

        consoleInfoSpy.mockRestore();
      });
    });

    describe('log storage', () => {
      it('should store logs in sessionStorage', () => {
        errorTracker.info('Message 1');
        errorTracker.warn('Message 2');

        const stored = sessionStorage.getItem('app_logs');
        expect(stored).not.toBe(null);

        const logs = JSON.parse(stored!);
        expect(logs).toHaveLength(2);
      });

      it('should limit stored logs to 100 entries', () => {
        // Add 150 logs
        for (let i = 0; i < 150; i++) {
          errorTracker.info(`Message ${i}`);
        }

        const logs = errorTracker.getLogs();
        expect(logs).toHaveLength(100);

        // Should keep the most recent ones
        const lastLog = logs[logs.length - 1];
        expect(lastLog.message).toBe('Message 149');
      });

      it('should handle storage errors gracefully', () => {
        // Fill up sessionStorage
        const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });

        // Should not throw
        expect(() => {
          errorTracker.info('Test message');
        }).not.toThrow();

        mockSetItem.mockRestore();
      });
    });

    describe('getLogs', () => {
      it('should return stored logs', () => {
        errorTracker.info('Message 1');
        errorTracker.warn('Message 2');

        const logs = errorTracker.getLogs();
        expect(logs).toHaveLength(2);
        expect(logs[0].message).toBe('Message 1');
        expect(logs[1].message).toBe('Message 2');
      });

      it('should return empty array when no logs exist', () => {
        const logs = errorTracker.getLogs();
        expect(logs).toEqual([]);
      });

      it('should handle corrupted storage data', () => {
        sessionStorage.setItem('app_logs', 'invalid json');

        const logs = errorTracker.getLogs();
        expect(logs).toEqual([]);
      });
    });

    describe('clearLogs', () => {
      it('should remove all stored logs', () => {
        errorTracker.info('Message 1');
        errorTracker.warn('Message 2');

        expect(errorTracker.getLogs()).toHaveLength(2);

        errorTracker.clearLogs();

        expect(errorTracker.getLogs()).toEqual([]);
        expect(sessionStorage.getItem('app_logs')).toBe(null);
      });
    });

    describe('downloadLogs', () => {
      it('should create a downloadable JSON file', () => {
        // Mock DOM APIs
        const createElementSpy = vi.spyOn(document, 'createElement');
        const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        const mockAnchor = {
          href: '',
          download: '',
          click: vi.fn(),
        } as unknown as HTMLAnchorElement;

        const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
        const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);

        createElementSpy.mockReturnValue(mockAnchor);

        errorTracker.info('Test log');
        errorTracker.downloadLogs();

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockAnchor.download).toMatch(/^app-logs-\d+\.json$/);
        expect(revokeObjectURLSpy).toHaveBeenCalled();
        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();

        // Cleanup
        createElementSpy.mockRestore();
        createObjectURLSpy.mockRestore();
        revokeObjectURLSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
      });
    });
  });

  describe('Convenience exports', () => {
    it('logDebug should work', () => {
      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      logDebug('Debug message', { key: 'value' });

      expect(consoleDebugSpy).toHaveBeenCalled();

      consoleDebugSpy.mockRestore();
    });

    it('logInfo should work', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      logInfo('Info message');

      expect(consoleInfoSpy).toHaveBeenCalled();

      consoleInfoSpy.mockRestore();
    });

    it('logWarn should work', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logWarn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('logError should work', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logError('Error message', new Error('Test error'));

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('trackAction should work', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      trackAction('test_action', { detail: 'test' });

      expect(consoleInfoSpy).toHaveBeenCalled();

      consoleInfoSpy.mockRestore();
    });
  });

  describe('Log levels', () => {
    it('should use correct console methods for each level', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorTracker.log(LogLevel.DEBUG, 'debug');
      errorTracker.log(LogLevel.INFO, 'info');
      errorTracker.log(LogLevel.WARN, 'warn');
      errorTracker.log(LogLevel.ERROR, 'error');

      expect(debugSpy).toHaveBeenCalledWith('[DEBUG]', 'debug', '');
      expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'info', '');
      expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'warn', '');
      expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'error', '');

      debugSpy.mockRestore();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });
});
