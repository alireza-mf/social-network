const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');
const checkObjectId = require('../../middleware/checkObjectId');


// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  '/:id',
  [
    auth,
    checkObjectId('id'),
    [check('text', 'Text is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/comment/:id/:comment_id/like
// @desc     Like a post
// @access   Private
router.put('/:id/:comment_id/like', [auth, checkObjectId('id')], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //const comment = await Comments.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );


    // Check if the comment has already been liked
    if (comment.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Comment already liked' });
    }

    comment.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(comment.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/comment/:id/:comment_id/unlike
// @desc     Unlike a post
// @access   Private
router.put('/:id/:comment_id/unlike', [auth, checkObjectId('id')], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comments = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Check if the post has not yet been liked
    if (!comments.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // remove the like
    comments.likes = comments.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await post.save();

    return res.json(comments.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/posts/comment/:id/:comment_id
// @desc     Reply a Comment
// @access   Private
router.post(
  '/:id/:comment_id',
  [
    auth,
    checkObjectId('id'),
    [check('text', 'Text is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      
      // Pull out comment
      const comments = post.comments.find(
      comment => comment.id === req.params.comment_id
      );

      const newReply = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      comments.replies.unshift(newReply);

      await post.save();

      res.json(comments.replies);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id/:reply_id
// @desc     Delete reply
// @access   Private
router.delete('/:id/:comment_id/:reply_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comments = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    // Pull out reply
    const reply = comments.replies.find(
      reply => reply.id === req.params.reply_id
    );
    // Make sure reply exists
    if (!reply) {
      return res.status(404).json({ msg: 'Reply does not exist' });
    }
    // Check user
    if (reply.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    comments.replies = comments.replies.filter(
      ({ id }) => id !== req.params.reply_id
    );

    await post.save();

    return res.json(comments.replies);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router
