using System.Collections.Generic;
using System.Drawing;
using AurenBraceletDesigner.Models;

namespace AurenBraceletDesigner.Data
{
    public static class Catalog
    {
        public static readonly IReadOnlyList<Chain> Chains = new List<Chain>
        {
            new Chain { Id="plata-italiana", Name="Plata italiana 925", Price=350m, BaseColor=Color.Silver },
            new Chain { Id="acero-oro", Name="Acero ba\u00f1ado en oro", Price=280m, BaseColor=Color.Goldenrod },
            new Chain { Id="acero-negro", Name="Acero negro", Price=260m, BaseColor=Color.Black }
        };

        public static readonly IReadOnlyList<Charm> AllCharms = new List<Charm>
        {
            new Charm { Id="c-letra-a", Name="Letra A", Price=60m, Category="letras", Emoji="A" },
            new Charm { Id="c-letra-e", Name="Letra E", Price=60m, Category="letras", Emoji="E" },
            new Charm { Id="c-corazon", Name="Coraz\u00f3n", Price=75m, Category="amor", Emoji="\u2764" },
            new Charm { Id="c-infinito", Name="Infinito", Price=90m, Category="amor", Emoji="\u221e" },
            new Charm { Id="c-aries", Name="Aries", Price=95m, Category="zodiaco", Emoji="\u2648" },
            new Charm { Id="c-leo", Name="Leo", Price=95m, Category="zodiaco", Emoji="\u264c" },
            new Charm { Id="c-huella", Name="Huella", Price=70m, Category="animales", Emoji="\U0001f43e" },
            new Charm { Id="c-mariposa", Name="Mariposa", Price=80m, Category="animales", Emoji="\U0001f98b" },
            new Charm { Id="c-estrella", Name="Estrella", Price=65m, Category="otros", Emoji="\u2605" },
            new Charm { Id="c-luna", Name="Luna", Price=65m, Category="otros", Emoji="\u263e" }
        };
    }
}
