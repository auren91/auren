using System.Globalization;

namespace AurenBraceletDesigner.Models
{
    public class Charm
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public string Emoji { get; set; }
        public string ImagePath { get; set; }

        public override string ToString() => $"{Name} - {Price.ToString("C", CultureInfo.CreateSpecificCulture("es-MX"))}";
    }
}
