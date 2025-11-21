// Redirect root to static public index.html
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/index.html',
      permanent: false,
    },
  }
}

export default function IndexRedirect() {
  return null
}
