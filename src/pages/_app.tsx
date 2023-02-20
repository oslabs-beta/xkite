import '@/styles/globals.scss';
import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
