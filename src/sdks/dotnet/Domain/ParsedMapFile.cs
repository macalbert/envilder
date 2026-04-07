namespace Envilder.Domain;

using System.Collections.Generic;

public class ParsedMapFile
{
    public MapFileConfig Config { get; init; } = null!;
    public Dictionary<string, string> Mappings { get; init; } = null!;
}
