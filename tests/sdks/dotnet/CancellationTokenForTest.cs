namespace Envilder.Tests;

using System.Threading;

public static class CancellationTokenForTest
{
    public const int ShortTimeout = 5_000;
    public const int LongTimeout = 120_000;

    public static CancellationToken CreateDefault =>
        new CancellationTokenSource(ShortTimeout).Token;

    public static CancellationToken CancelAfter(int seconds) =>
        new CancellationTokenSource(seconds * 1000).Token;
}
