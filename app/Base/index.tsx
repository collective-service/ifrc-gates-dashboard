import React, { useMemo } from 'react';
// import { Router } from 'react-router-dom';
import { init, ErrorBoundary } from '@sentry/react';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import ReactGA from 'react-ga';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@the-deep/deep-ui/build/index.css';

import { setMapboxToken } from '@togglecorp/re-map';

import {
    getDashboardLink,
    parseQueryString,
} from '#utils/common';

import PreloadMessage from '#base/components/PreloadMessage';
import browserHistory from '#base/configs/history';
import sentryConfig from '#base/configs/sentry';
import apolloConfig from '#base/configs/apollo';
import { trackingId, gaConfig } from '#base/configs/googleAnalytics';
import { mapboxToken } from '#base/configs/env';

import Dashboard from '#views/Dashboard';
import {
    processGatesUrls,
    processGatesOptions,
    processGatesResponse,
    processGatesError,
    RequestContext,
} from '#base/utils/restRequest';

import styles from './styles.css';

if (mapboxToken) {
    setMapboxToken(mapboxToken);
}

if (sentryConfig) {
    init(sentryConfig);
}

if (trackingId) {
    ReactGA.initialize(trackingId, gaConfig);
    browserHistory.listen((location) => {
        const page = location.pathname ?? window.location.pathname;
        ReactGA.set({ page });
        ReactGA.pageview(page);
    });
}

const apolloClient = new ApolloClient(apolloConfig);

interface Win {
    standaloneMode?: boolean;

    page?: 'dashboard';
}

const standaloneMode = (window as Win).standaloneMode ?? false;

const query: Win = parseQueryString(window.location.search);

const currentPage = (window as Win).page || query.page;

function Base() {
    const page = useMemo(
        () => {
            if (currentPage === 'dashboard') {
                return (
                    <div className={styles.view}>
                        <Dashboard />
                    </div>
                );
            }

            if (standaloneMode) {
                return (
                    <>
                        <a href={getDashboardLink()}>
                            Dashboard
                        </a>
                    </>
                );
            }
            return null;
        },
        [],
    );

    const requestContextValue = useMemo(
        () => ({
            transformUrl: processGatesUrls,
            transformOptions: processGatesOptions,
            transformResponse: processGatesResponse,
            transformError: processGatesError,
        }),
        [],
    );

    return (
        <div className={styles.base}>
            <ErrorBoundary
                showDialog
                fallback={(
                    <PreloadMessage
                        heading="Oh no!"
                        content="Some error occurred!"
                    />
                )}
            >
                <RequestContext.Provider value={requestContextValue}>
                    <ApolloProvider client={apolloClient}>
                        {page}
                    </ApolloProvider>
                </RequestContext.Provider>
            </ErrorBoundary>
        </div>
    );
}

export default Base;
