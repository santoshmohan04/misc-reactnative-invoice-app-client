/**
 * Error utility for constructing and displaying error alerts
 * Type-safe error message extraction from various error formats
 */

import { Alert, AlertStatic } from 'react-native';
import { ApiErrorWithStatus } from '../types';

/**
 * Structured error object with extracted message
 */
interface ExtractedError {
  message: string;
  title: string;
}

/**
 * Error utilities for React Native alerts
 * Handles various error types (Error, API errors, string messages)
 */
export class ErrorUtils {
  readonly errorTitle: string;
  readonly errorText: string;

  constructor(error: unknown, title: string = '') {
    this.errorTitle = title;
    this.errorText = this.extractErrorMessage(error);
  }

  /**
   * Extract error message from various error formats
   * Handles: Error, ApiErrorWithStatus, objects with responseBody, plain strings
   */
  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (error instanceof ApiErrorWithStatus) {
      // API error with status
      const data = error.data as { message?: string } | undefined;
      const message = error.message || data?.message;
      return typeof message === 'string' ? message : error.toString();
    }

    if (typeof error === 'object' && error !== null) {
      const obj = error as any;
      // Try responseBody.message
      if (obj.responseBody?.message) {
        return obj.responseBody.message;
      }
      // Try message prop
      if (obj.message) {
        return obj.message;
      }
      // Try error prop
      if (obj.error) {
        return typeof obj.error === 'string' ? obj.error : obj.error.message;
      }
      // Try converting object to string
      if (typeof obj.toString === 'function') {
        return obj.toString();
      }
    }

    return 'Something went wrong';
  }

  /**
   * Show alert dialog with extracted error message
   */
  showAlert(): void {
    Alert.alert(this.errorTitle, String(this.errorText), [
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  }
}

/**
 * Utility function to get error message from various error types
 * Useful for logging or conditional rendering
 */
export const getErrorMessage = (error: unknown): string => {
  const errorUtils = new ErrorUtils(error);
  return errorUtils.errorText;
};

/**
 * Utility function to show error alert
 * Shorthand for new ErrorUtils(error, title).showAlert()
 */
export const showErrorAlert = (error: unknown, title: string = 'Error'): void => {
  new ErrorUtils(error, title).showAlert();
};
