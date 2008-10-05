using System;
using System.Collections.Generic;

namespace Tenpow.Site.Photos
{
    public class Photo
    {
        public string Url
        {
            get;
            private set;
        }

        public string Caption
        {
            get;
            private set;
        }

        public Photo(string url, string caption)
        {
            Url = url;
            Caption = caption;
        }

        public override string ToString()
        {
            return "Url: " + Url + ", Caption: " + Caption;
        }
    }
}
