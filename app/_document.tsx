import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof Promise.withResolvers === 'undefined') {
                Promise.withResolvers = function() {
                  let resolve, reject;
                  const promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                  });
                  return { promise, resolve, reject };
                };
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
