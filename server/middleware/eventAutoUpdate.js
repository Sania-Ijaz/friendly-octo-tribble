const Activity = require('../models/Activity');
const Task = require('../models/Task');
const Resource = require('../models/Resource');
const Person = require('../models/Person');
const FinancialAccount = require('../models/FinancialAccount');

/**
 * Middleware that runs after an event is saved to propagate changes to related documents.
 * Attach to the request object as req.eventAutoUpdate(savedEvent) if used standalone.
 */
const eventAutoUpdate = async (savedEvent) => {
  const eventId = savedEvent._id;
  const promises = [];

  if (savedEvent.activityIds && savedEvent.activityIds.length > 0) {
    promises.push(
      Activity.updateMany(
        { _id: { $in: savedEvent.activityIds } },
        { $addToSet: { events: eventId } }
      )
    );
  }

  if (savedEvent.taskProgress && savedEvent.taskProgress.size > 0) {
    for (const [taskId, progress] of savedEvent.taskProgress.entries()) {
      promises.push(
        Task.findByIdAndUpdate(taskId, {
          $inc: { quantitativeProgress: progress },
          $addToSet: { events: eventId },
        })
      );
    }
  }

  if (savedEvent.resourceIds && savedEvent.resourceIds.length > 0) {
    promises.push(
      Resource.updateMany(
        { _id: { $in: savedEvent.resourceIds } },
        {
          $addToSet: { linkedEvents: eventId },
          $inc: { 'usageMetrics.timesUsed': 1 },
        }
      )
    );
  }

  if (savedEvent.peopleIds && savedEvent.peopleIds.length > 0) {
    promises.push(
      Person.updateMany(
        { _id: { $in: savedEvent.peopleIds } },
        { $addToSet: { linkedEvents: eventId } }
      )
    );
  }

  if (
    savedEvent.financialImpact &&
    savedEvent.financialImpact.accountId &&
    savedEvent.financialImpact.amount !== undefined &&
    savedEvent.financialImpact.type
  ) {
    const balanceDelta =
      savedEvent.financialImpact.type === 'earned'
        ? savedEvent.financialImpact.amount
        : -savedEvent.financialImpact.amount;

    promises.push(
      FinancialAccount.findByIdAndUpdate(savedEvent.financialImpact.accountId, {
        $inc: { balance: balanceDelta },
        $addToSet: { events: eventId },
      })
    );
  }

  await Promise.all(promises);
};

module.exports = eventAutoUpdate;
