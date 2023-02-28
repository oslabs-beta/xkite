import getPort, { portNumbers } from 'get-port';

// I made up the second number for all of these... it's the start port +200
const DEFAULT_BROKER_PORT = 7771;
const DEFAULT_BROKER_JMX_PORT = 9992;
const DEFAULT_ZOOKEEPER_PORT = 8881;
const DEFAULT_JMX_PORT = 5951;
const DEFAULT_SPRING_PORT = 8030;

export function getDefaultPorts(type: string, count: number) {}

export async function getPorts(
  firstPort: number,
  count: number
): Promise<number[]> {
  const availablePorts: number[] = [];
  // Arbitrary cap to try to keep port numbers in a relatively sane range
  const maxPort = firstPort + 200;

  for (count; count > 0; count--) {
    const newPort = await getPort({ port: portNumbers(firstPort, maxPort) });
    firstPort = newPort;
    availablePorts.push(newPort);
  }
  return availablePorts;
}

// (async () => {
//   const myPorts = await getPorts(9089, 5);
//   console.log(myPorts);
// })();
