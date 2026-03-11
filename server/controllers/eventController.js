const Event = require('../models/Event');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const Resource = require('../models/Resource');
const Person = require('../models/Person');
const FinancialAccount = require('../models/FinancialAccount');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const filterEvents = async (req, res) => {
  try {
    const { activityId, startDate, endDate, resourceId, personId, accountId } = req.query;
    const filter = {};
    if (activityId) filter.activityIds = activityId;
    if (resourceId) filter.resourceIds = resourceId;
    if (personId) filter.peopleIds = personId;
    if (accountId) filter['financialImpact.accountId'] = accountId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    const events = await Event.find(filter);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    const saved = await event.save();

    const eventId = saved._id;
    const promises = [];

    // 1. Add eventId to each referenced activity's events array
    if (saved.activityIds && saved.activityIds.length > 0) {
      promises.push(
        Activity.updateMany(
          { _id: { $in: saved.activityIds } },
          { $addToSet: { events: eventId } }
        )
      );
    }

    // 2. Update task progress for each entry in taskProgress map
    if (saved.taskProgress && saved.taskProgress.size > 0) {
      for (const [taskId, progress] of saved.taskProgress.entries()) {
        promises.push(
          Task.findByIdAndUpdate(taskId, {
            $inc: { quantitativeProgress: progress },
            $addToSet: { events: eventId },
          })
        );
      }
    }

    // 3. Add eventId to each referenced resource's linkedEvents; increment timesUsed
    if (saved.resourceIds && saved.resourceIds.length > 0) {
      promises.push(
        Resource.updateMany(
          { _id: { $in: saved.resourceIds } },
          {
            $addToSet: { linkedEvents: eventId },
            $inc: { 'usageMetrics.timesUsed': 1 },
          }
        )
      );
    }

    // 4. Add eventId to each referenced person's linkedEvents
    if (saved.peopleIds && saved.peopleIds.length > 0) {
      promises.push(
        Person.updateMany(
          { _id: { $in: saved.peopleIds } },
          { $addToSet: { linkedEvents: eventId } }
        )
      );
    }

    // 5. Update financial account balance and add eventId
    if (
      saved.financialImpact &&
      saved.financialImpact.accountId &&
      saved.financialImpact.amount !== undefined &&
      saved.financialImpact.type
    ) {
      const balanceDelta =
        saved.financialImpact.type === 'earned'
          ? saved.financialImpact.amount
          : -saved.financialImpact.amount;

      promises.push(
        FinancialAccount.findByIdAndUpdate(saved.financialImpact.accountId, {
          $inc: { balance: balanceDelta },
          $addToSet: { events: eventId },
        })
      );
    }

    await Promise.all(promises);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const previous = await Event.findById(req.params.id);
    if (!previous) return res.status(404).json({ message: 'Event not found' });

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const eventId = event._id;
    const promises = [];

    // Propagate newly added activityIds
    const prevActivityIds = previous.activityIds.map(String);
    const newActivityIds = (event.activityIds || []).filter(
      (id) => !prevActivityIds.includes(String(id))
    );
    if (newActivityIds.length > 0) {
      promises.push(
        Activity.updateMany(
          { _id: { $in: newActivityIds } },
          { $addToSet: { events: eventId } }
        )
      );
    }

    // Propagate newly added or changed taskProgress entries
    if (event.taskProgress && event.taskProgress.size > 0) {
      for (const [taskId, newProgress] of event.taskProgress.entries()) {
        const prevProgress = previous.taskProgress ? (previous.taskProgress.get(taskId) || 0) : 0;
        const delta = newProgress - prevProgress;
        if (delta !== 0) {
          promises.push(
            Task.findByIdAndUpdate(taskId, {
              $inc: { quantitativeProgress: delta },
              $addToSet: { events: eventId },
            })
          );
        }
      }
    }

    // Propagate newly added resourceIds
    const prevResourceIds = previous.resourceIds.map(String);
    const newResourceIds = (event.resourceIds || []).filter(
      (id) => !prevResourceIds.includes(String(id))
    );
    if (newResourceIds.length > 0) {
      promises.push(
        Resource.updateMany(
          { _id: { $in: newResourceIds } },
          { $addToSet: { linkedEvents: eventId }, $inc: { 'usageMetrics.timesUsed': 1 } }
        )
      );
    }

    // Propagate newly added peopleIds
    const prevPeopleIds = previous.peopleIds.map(String);
    const newPeopleIds = (event.peopleIds || []).filter(
      (id) => !prevPeopleIds.includes(String(id))
    );
    if (newPeopleIds.length > 0) {
      promises.push(
        Person.updateMany(
          { _id: { $in: newPeopleIds } },
          { $addToSet: { linkedEvents: eventId } }
        )
      );
    }

    // Reconcile financialImpact balance changes
    const prevImpact = previous.financialImpact;
    const newImpact = event.financialImpact;
    const prevAccountId = prevImpact && prevImpact.accountId ? String(prevImpact.accountId) : null;
    const newAccountId = newImpact && newImpact.accountId ? String(newImpact.accountId) : null;

    if (prevAccountId) {
      // Reverse the previous balance change
      const reverseDelta =
        prevImpact.type === 'earned' ? -prevImpact.amount : prevImpact.amount;
      promises.push(
        FinancialAccount.findByIdAndUpdate(prevImpact.accountId, {
          $inc: { balance: reverseDelta },
        })
      );
    }
    if (newAccountId && newImpact.amount !== undefined && newImpact.type) {
      // Apply the new balance change
      const applyDelta = newImpact.type === 'earned' ? newImpact.amount : -newImpact.amount;
      promises.push(
        FinancialAccount.findByIdAndUpdate(newImpact.accountId, {
          $inc: { balance: applyDelta },
          $addToSet: { events: eventId },
        })
      );
    }

    await Promise.all(promises);

    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const eventId = event._id;
    const promises = [];

    // Remove eventId from activities
    if (event.activityIds && event.activityIds.length > 0) {
      promises.push(
        Activity.updateMany(
          { _id: { $in: event.activityIds } },
          { $pull: { events: eventId } }
        )
      );
    }

    // Remove eventId from tasks and reverse task progress
    if (event.taskProgress && event.taskProgress.size > 0) {
      for (const [taskId, progress] of event.taskProgress.entries()) {
        promises.push(
          Task.findByIdAndUpdate(taskId, {
            $inc: { quantitativeProgress: -progress },
            $pull: { events: eventId },
          })
        );
      }
    }

    // Remove eventId from resources and decrement timesUsed
    if (event.resourceIds && event.resourceIds.length > 0) {
      promises.push(
        Resource.updateMany(
          { _id: { $in: event.resourceIds } },
          {
            $pull: { linkedEvents: eventId },
            $inc: { 'usageMetrics.timesUsed': -1 },
          }
        )
      );
    }

    // Remove eventId from people
    if (event.peopleIds && event.peopleIds.length > 0) {
      promises.push(
        Person.updateMany(
          { _id: { $in: event.peopleIds } },
          { $pull: { linkedEvents: eventId } }
        )
      );
    }

    // Reverse financial account balance change and remove eventId
    if (
      event.financialImpact &&
      event.financialImpact.accountId &&
      event.financialImpact.amount !== undefined &&
      event.financialImpact.type
    ) {
      const reverseDelta =
        event.financialImpact.type === 'earned'
          ? -event.financialImpact.amount
          : event.financialImpact.amount;
      promises.push(
        FinancialAccount.findByIdAndUpdate(event.financialImpact.accountId, {
          $inc: { balance: reverseDelta },
          $pull: { events: eventId },
        })
      );
    }

    await Promise.all(promises);

    res.status(200).json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEvents,
  filterEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
