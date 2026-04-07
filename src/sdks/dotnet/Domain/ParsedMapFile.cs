using System.Collections.Generic;

namespace Envilder.Domain;

public class ParsedMapFile
{
    public MapFileConfig Config { get; init; } = null!;
    public Dictionary<string, string> Mappings { get; init; } = null!;
}
