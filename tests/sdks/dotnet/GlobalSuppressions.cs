// This file is used by Code Analysis to maintain SuppressMessage
// attributes that are applied to this project.
// Project-level suppressions either have no target or are given
// a specific target and scoped to a namespace, type, member, etc.

using System.Diagnostics.CodeAnalysis;

[assembly: SuppressMessage(
	"Style",
	"VSTHRD200:Use \"Async\" suffix for async methods",
	Justification = "Test method names follow Should_Expected_When_Condition pattern",
	Scope = "namespaceanddescendants",
	Target = "~N:Envilder.Tests")]
[assembly: SuppressMessage(
	"Naming",
	"CA1707:Identifiers should not contain underscores",
	Justification = "Test method names use underscores by convention",
	Scope = "namespaceanddescendants",
	Target = "~N:Envilder.Tests")]