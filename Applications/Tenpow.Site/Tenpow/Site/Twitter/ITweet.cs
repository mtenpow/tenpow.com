using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;

namespace Tenpow.Site.Twitter
{
    [Intrinsic]
    public interface ITweet
    {
        [Intrinsic("in_reply_to_status_id")]
        int InReplyToStatusId
        {
            get;
        }

        [Intrinsic("favorited")]
        bool Favorited
        {
            get;
        }

        [Intrinsic("in_reply_to_user_id")]
        int InReplyToUserId
        {
            get;
        }

        [Intrinsic("truncated")]
        bool Truncated
        {
            get;
        }

        [Intrinsic("source")]
        string Source
        {
            get;
        }

        [Intrinsic("created_at")]
        string CreatedAt
        {
            get;
        }

        [Intrinsic("text")]
        string Text
        {
            get;
        }
    }

    [Intrinsic]
    public interface ISearchResultTweet : ITweet
    {
        [Intrinsic("id")]
        int Id
        {
            get;
        }

        [Intrinsic("profile_image_url")]
        string ProfileImageUrl
        {
            get;
        }
    }

    [Intrinsic]
    public interface IUserTimelineTweet : ITweet
    {

        [Intrinsic("user")]
        ITwitterUser User
        {
            get;
        }
    }
}
