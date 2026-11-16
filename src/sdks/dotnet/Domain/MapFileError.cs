namespace Envilder;

/// <summary>
/// One reason the map file cannot be used. <see cref="Key"/> names the
/// offending entry (<c>DB_URL</c>, <c>$config.profile</c>,
/// <c>WithProfile()</c>, or <c>(root)</c> for the document itself). Neither
/// field ever carries a mapped value.
/// </summary>
public class MapFileError
{
	/// <summary>Initializes a new instance.</summary>
	/// <param name="key">The offending entry.</param>
	/// <param name="message">What is wrong with it.</param>
	public MapFileError(string key, string message)
	{
		Key = key;
		Message = message;
	}

	/// <summary>The offending entry.</summary>
	public string Key { get; }

	/// <summary>What is wrong with the entry.</summary>
	public string Message { get; }
}