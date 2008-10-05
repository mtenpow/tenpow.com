using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;

namespace Tenpow.Site.Twitter
{
    [Intrinsic]
    public interface ITwitterUser
    {
        [Intrinsic("profile_image_url")]
        string ProfileImageUrl
        {
            get;
        }

        [Intrinsic("description")]
        string Description
        {
            get;
        }

        [Intrinsic("screen_name")]
        string ScreenName
        {
            get;
        }

        [Intrinsic("followers_count")]
        int FollowersCount
        {
            get;
        }

        [Intrinsic("url")]
        string Url
        {
            get;
        }

        [Intrinsic("name")]
        string Name
        {
            get;
        }

        [Intrinsic("protected")]
        bool Protected
        {
            get;
        }

        [Intrinsic("location")]
        string Location
        {
            get;
        }

        [Intrinsic("id")]
        string Id
        {
            get;
        }
    }
}
