import React from 'react';
// import { Router } from 'react-router-dom';
import { init, ErrorBoundary } from '@sentry/react';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import ReactGA from 'react-ga';
import 'requestidlecallback-polyfill';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@the-deep/deep-ui/build/index.css';
import { setMapboxToken } from '@togglecorp/re-map';

import PreloadMessage from '#base/components/PreloadMessage';
import browserHistory from '#base/configs/history';
import sentryConfig from '#base/configs/sentry';
import apolloConfig from '#base/configs/apollo';
import { trackingId, gaConfig } from '#base/configs/googleAnalytics';
import { mapboxToken } from '#base/configs/env';

import Dashboard from '#views/Dashboard';
import goarnLogo from '#resources/icons/goarn.png';
import ifrcLogo from '#resources/icons/ifrc.png';
import unicefLogo from '#resources/icons/unicef.png';
import logo from '#resources/icons/cs_logo.png';
import whoLogo from '#resources/icons/who.png';
import {
    wsEndpoint,
    adminEndpoint,
} from '#base/configs/restRequest';

import styles from './styles.css';

const footerDescription = 'Developed by the Collective Service – partnership between the International Federation of Red Cross and Red Crescent Societies (IFRC), United Nations Children\'s Fund (UNICEF), the World Health Organization (WHO) and the Global Outbreak Alert and Response Network (GOARN).';

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

function Base() {
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
                <ApolloProvider client={apolloClient}>
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <div className={styles.leftContainer}>
                                <a
                                    href="https://www.rcce-collective.net/"
                                    target="_blank"
                                    rel="license noopener noreferrer"
                                >
                                    <img
                                        className={styles.logo}
                                        src={logo}
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className={styles.rightContainer}>
                                <a
                                    className={styles.navItem}
                                    href={wsEndpoint}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    API
                                </a>
                                <a
                                    className={styles.navItem}
                                    href={adminEndpoint}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Admin
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className={styles.view}>
                        <Dashboard />
                    </div>
                    <div className={styles.footer}>
                        <p className={styles.footerDescription}>
                            {footerDescription}
                        </p>
                        <div className={styles.logoContainer}>
                            <img
                                className={styles.logo}
                                src={ifrcLogo}
                                alt=""
                            />
                            <img
                                className={styles.logo}
                                src={unicefLogo}
                                alt=""
                            />
                            <img
                                className={styles.logo}
                                src={whoLogo}
                                alt=""
                            />
                            <img
                                className={styles.logo}
                                src={goarnLogo}
                                alt=""
                            />
                        </div>
                        <div className={styles.copyright}>
                            <div className={styles.links}>
                                <a
                                    href="http://creativecommons.org/licenses/by-sa/4.0/"
                                    target="_blank"
                                    rel="license noopener noreferrer"
                                >
                                    <img
                                        alt="Creative Commons License"
                                        src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png"
                                    />
                                </a>
                                This work is licensed under a
                                <a
                                    href="http://creativecommons.org/licenses/by-sa/4.0/"
                                    className={styles.link}
                                    target="_blank"
                                    rel="license noopener noreferrer"
                                >
                                    Creative Commons Attribution
                                    -ShareAlike 4.0 International License
                                </a>
                            </div>
                        </div>
                    </div>
                </ApolloProvider>
            </ErrorBoundary>
        </div>
    );
}

export default Base;
