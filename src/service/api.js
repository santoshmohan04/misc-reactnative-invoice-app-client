import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * @todo
 * Change this url based on server ip address
 * @type {string}
 */
const configuredBaseUrl = Constants.expoConfig?.extra?.baseUrl;
const configuredWebBaseUrl = Constants.expoConfig?.extra?.webBaseUrl;
const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

const sanitizeBaseUrl = (value) => (value || '').replace(/\/$/, '');

const getWebBaseUrl = () => {
    const candidate = envBaseUrl || configuredWebBaseUrl || configuredBaseUrl || 'http://localhost:3333';

    try {
        const parsedUrl = new URL(candidate);
        if (typeof window !== 'undefined' && window.location?.hostname) {
            // Keep web requests on the same reachable host (localhost vs LAN IP).
            parsedUrl.hostname = window.location.hostname;
        }
        return sanitizeBaseUrl(parsedUrl.toString());
    } catch (error) {
        return sanitizeBaseUrl(candidate);
    }
};

const BASE_URL = Platform.OS === 'web'
    ? getWebBaseUrl()
    : sanitizeBaseUrl(envBaseUrl || configuredBaseUrl || 'http://localhost:3333');

/**
 * Basic API function that handles sending all application requests
 *
 * @param url
 * @param method
 * @param body
 * @param headers
 * @returns {Promise<unknown>}
 */
export const api = async (url, method, body = null, headers = {}) => {
    try {
        const endPoint = BASE_URL.concat(url);
        const requestBody = body ? JSON.stringify(body) : null;
        const fetchParams = {method, headers};

        if ((method === 'POST' || method === 'PUT') && !requestBody) {
            throw new Error('Request body requires');
        }

        if (requestBody) {
            fetchParams.headers['Content-type'] = 'application/json';
            fetchParams.body = requestBody;
        }

        const fetchPromise = fetch(endPoint, fetchParams);
        const timeOutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('Request Timeout');
            }, 5000);
        });

        return await Promise.race([fetchPromise, timeOutPromise]);
    } catch (e) {
        throw new Error(e);
    }
};

/**
 * Function that constructs api requests and calls api function
 *
 * @param url
 * @param method
 * @param body
 * @param statusCode
 * @param token
 * @param loader
 * @param promiseReturnType
 * @returns {Promise<{responseBody: null, success: boolean, token: null}>}
 */
const parseResponseBody = async (response) => {
    const responseText = await response.text();
    if (!responseText) {
        return null;
    }

    try {
        return JSON.parse(responseText);
    } catch (e) {
        return responseText;
    }
};

const unwrapSuccessPayload = (responseBody) => {
    if (responseBody && typeof responseBody === 'object' && 'data' in responseBody) {
        return responseBody.data;
    }
    return responseBody;
};

const getTokenFromResponse = (response, parsedBody) => {
    const headerToken = response.headers.get('x-auth')
        || response.headers.get('x-access-token')
        || response.headers.get('authorization');

    if (headerToken) {
        return headerToken.replace(/^Bearer\s+/i, '');
    }

    const successPayload = unwrapSuccessPayload(parsedBody);
    if (successPayload && typeof successPayload === 'object') {
        return successPayload.accessToken
            || successPayload.token
            || successPayload.authToken
            || successPayload.tokens?.accessToken
            || successPayload.tokens?.token
            || null;
    }

    return null;
};

const getRefreshTokenFromResponse = (response, parsedBody) => {
    const headerRefresh = response.headers.get('x-refresh-token');
    if (headerRefresh) {
        return headerRefresh;
    }

    const successPayload = unwrapSuccessPayload(parsedBody);
    if (successPayload && typeof successPayload === 'object') {
        return successPayload.refreshToken
            || successPayload.tokens?.refreshToken
            || null;
    }

    return null;
};

export const fetchApi = async (url,
                               method,
                               body,
                               statusCode,
                               token = null,
                               loader = false,
                               promiseReturnType = 'json') => {
    try {
        const headers = {};
        const result = {
            token: null,
            refreshToken: null,
            success: false,
            responseBody: null,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await api(url, method, body, headers);
        const parsedBody = await parseResponseBody(response);

        if (response.status === statusCode) {
            result.success = true;
            result.token = getTokenFromResponse(response, parsedBody);
            result.refreshToken = getRefreshTokenFromResponse(response, parsedBody);
            result.responseBody = unwrapSuccessPayload(parsedBody);
            return result;
        }

        result.responseBody = parsedBody;
        throw result;
    } catch (error) {
        throw error;
    }
};
