using System;
using System.Collections.Generic;
using System.Threading;
using System.Runtime.InteropServices;
using System.Runtime.CompilerServices;
using XaeiOS.Process;

namespace Tenpow.Photos
{
    class Program
    {
        private static PhotoSlideshow _slideshow;
        private static int _slideshowPid;

        private static void Main(string[] args)
        {
            SIP slideshowProcess = new SIP(delegate()
            {
                Photo[] photos = new Photo[]{
                    new Photo("Photos/michaelten-pow.jpg", "My two sisters, Kaya and Alicia, and me"),
                    new Photo("Photos/lounging_at_pool.jpg", "Lounging by the pool at the Planet Hollywood Hotel, Las Vegas"),
                    new Photo("Photos/coaster.jpg", "Autumn and me on the roller coaster at New York, New York, Las Vegas"),
                    new Photo("Photos/just_michael.jpg", "Just me"),
                    new Photo("Photos/paris_vegas.jpg", "Autumn and me at Paris, Las Vegas"),
                    new Photo("Photos/checking_in.jpg", "Checking into the Planet Hollywood Hotel, Las Vegas"),
                    new Photo("Photos/autumn_and_michael.jpg", "Autumn and me"),
                    new Photo("Photos/wii_at_earls.jpg", "Playing Wii Sports Golf at Earl's house"),
                    new Photo("Photos/packed_jeep.jpg", "My Jeep packed full of my cousin Michelle's belongings.  I was helping her move.")
                };

                _slideshow = new PhotoSlideshow(photos, 10 * 1000);
                SignalDaemon.Start();
                ExportDelegate("ShowNextPhoto", ExportedShowNextPhoto);
                ExportDelegate("ShowPreviousPhoto", ExportedShowPreviousPhoto);
                _slideshow.ShowPhoto(0);
                _slideshow.StartSlideshow();
            }, ThreadPriority.Normal, "Tenpow.Photos");

            // install a custom signal handler to call the appropriate method based upon the SlideshowSignal that we receive
            slideshowProcess.CustomSignal += delegate(int data)
            {
                SlideshowSignal signal = (SlideshowSignal)data;
                if (signal == SlideshowSignal.ShowNextPhoto)
                {
                    _slideshow.ShowNextPhoto();
                }
                else if (signal == SlideshowSignal.ShowPreviousPhoto)
                {
                    _slideshow.ShowPreviousPhoto();
                }
                else
                {
                    Console.WriteLine("Received unknown signal " + data);
                }
            };
            slideshowProcess.Start();
            _slideshowPid = slideshowProcess.ID;
        }

        [XaeiOSMethodImpl(MethodImplOptions.NonPreemptive)]
        static void ExportedShowNextPhoto()
        {
            SignalDaemon.SendSignal(_slideshowPid, Signal.Custom, (int)SlideshowSignal.ShowNextPhoto);
        }

        [XaeiOSMethodImpl(MethodImplOptions.NonPreemptive)]
        static void ExportedShowPreviousPhoto()
        {
            SignalDaemon.SendSignal(_slideshowPid, Signal.Custom, (int)SlideshowSignal.ShowPreviousPhoto);
        }

        [XaeiOSMethodImpl(MethodImplOptions.Inline, Implementation = "window[{0}] = {1}")]
        static extern void ExportDelegate(string name, NativeVoidDelegate d);

        private enum SlideshowSignal : int
        {
            ShowNextPhoto = 1,
            ShowPreviousPhoto = 2
        }
    }
}