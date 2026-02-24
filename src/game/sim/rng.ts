export class XorShift32
{
    private state: number;

    constructor (seed: number)
    {
        this.state = seed >>> 0;
    }

    setSeed (seed: number): void
    {
        this.state = seed >>> 0;
    }

    nextUint (): number
    {
        let x = this.state;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.state = x >>> 0;
        return this.state;
    }

    nextFloat (): number
    {
        return this.nextUint() / 4294967296;
    }
}
