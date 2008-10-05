using System;
using System.Reflection;
using System.Threading;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Diagnostics;

namespace XaeiOS.TestSuite.Tests
{
    public class ThreadingTestSuite : TestSuite
    {
        // TODO: These timed conditions are not used properly
        // Use a CountDownLatch instead
        [Test]
        public void TestAbortThread()
        {
            Lock sync = new Lock();
            TimedCondition aborted = new TimedCondition(sync);
            Thread testThread = new Thread(delegate()
            {
                try
                {
                    Log("Test thread sleeping for 8 seconds..");
                    Thread.Sleep(8000);
                }
                catch (ThreadAbortException)
                {
                    Log("Test thread aborted..");
                    aborted.Signal();
                }
                Fail("This line should never be executed");
            });
            testThread.Start();
            sync.Acquire();
            Log("Aborting test thread in 2 seconds.  Sleeping...");
            Thread.Sleep(2000);
            Log("...awake!  Going to abort the test thread.");
            testThread.Abort();
            Log("Called testThread.Abort()");

            try
            {
                aborted.Await(12000);
            }
            catch (ConditionTimedOutException)
            {
                Fail("Thread was not aborted as expected!");
            }
        }

        [Test]
        public void TestAbortThreadWithState()
        {
            Lock sync = new Lock();
            TimedCondition aborted = new TimedCondition(sync);
            Thread testThread = new Thread(delegate()
            {
                try
                {
                    Log("Test thread sleeping for 8 seconds..");
                    Thread.Sleep(8000);
                }
                catch (ThreadAbortException e)
                {
                    if (e.ExceptionState != null && e.ExceptionState.ToString() == "Exception state")
                    {
                        Log("Test thread aborted with state: " + e.ExceptionState);
                        aborted.Signal();
                    }
                    else
                    {
                        Log("Test thread aborted with unknown state: " + e.ExceptionState);
                    }
                }
                Fail("This line should never be executed");
            });
            testThread.Start();
            sync.Acquire();
            Log("Aborting test thread in 2 seconds");
            Thread.Sleep(2000);
            testThread.Abort("Exception state");

            try
            {
                aborted.Await(12000);
            }
            catch (ConditionTimedOutException)
            {
                Fail("Thread was not aborted as expected!");
            }
        }

        [Test]
        public void TestLockIdiom()
        {
            object sync = new object();
            lock (sync)
            {
                Log("In locked section");
            }
            Log("Outside of locked section");
        }


        // TODO: The anonymous delegate in this method break XaeiO.Compiler
        [Test]
        public void TestLockIdiomUnlocksWhenExceptionsAreThrown()
        {
            object sync = new object();
            try
            {
                lock (sync)
                {
                    Log("In locked section");
                    throw new Exception("Purposefully thrown");
                }
            }
            catch (Exception)
            { }

            bool secondThreadAcquiredLock = false;
            Lock secondThreadDoneLock = new Lock();
            Condition secondThreadDone = new Condition(secondThreadDoneLock);
            Thread secondThread = new Thread(delegate()
            {
                secondThreadAcquiredLock = Monitor.TryEnter(sync);
            });
            secondThread.Start();
            secondThreadDone.Await();
            Assert("Finally block of lock idiom should have unlocked sync obj", secondThreadAcquiredLock);
        }

        [Test]
        public void TestManualResetEvent()
        {
            ManualResetEvent firstEvent = new ManualResetEvent();
            ManualResetEvent secondEvent = new ManualResetEvent();
            bool firstEventWorked = false;
            Thread testThread = new Thread(delegate()
            {
                Log("Test thread waiting on first event..");
                firstEvent.WaitOne();
                Log("....test thread awake!");
                firstEventWorked = true;
                Log("Test thread setting the second event");
                secondEvent.Set();
                Log("Test thread set the second event");
            });
            testThread.Start();
            Log("Main thread sleeping for 2 seconds.  Sleeping...");
            Thread.Sleep(2000);
            Log("...main thread awake!  Going to set the first event.");
            firstEvent.Set();
            Log("Main thread set the first event.  Going to wait for the test thread to set the second event");
            secondEvent.WaitOne();
            Log("...main thread awake!");

            Assert("Test thread didn't wake up when the first event was signalled", firstEventWorked);
        }
    }
}