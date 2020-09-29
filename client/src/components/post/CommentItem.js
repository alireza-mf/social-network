import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'react-moment';
import { addCommentLike, removeCommentLike, deleteComment  } from '../../actions/post';
import ReplyItem from './ReplyItem';
import ReplyForm from './ReplyForm';

const CommentItem = ({
  postId,
  comment: { _id, text, name, avatar, user, date, likes, replies },
  auth,
  deleteComment, addCommentLike, removeCommentLike
}) => {
  const [displayAddReplyBtn, toggleAddReplyBtn] = useState(false);
  return (
        <div className='post bg-white p-1 my-1'>
          <div>
            <div>
              <Link to={`/profile/${user}`}>
                <img className='round-img' src={avatar} alt='' />
                <h4>{name}</h4>
              </Link>
            </div>
            <div>
              <p className='my-1'>{text}</p>
              <p className='post-date'>
                Posted on <Moment format='YYYY/MM/DD'>{date}</Moment>
              </p>
              <button
                onClick={() => addCommentLike(postId, _id)}
                type='button'
                className='btn btn-light'
              >
                <i className='fas fa-thumbs-up' />{' '}
                <span>{likes.length > 0 && <span>{likes.length}</span>}</span>
              </button>
              <button
                onClick={() => removeCommentLike(postId, _id)}
                type='button'
                className='btn btn-light'
              >
                <i className='fas fa-thumbs-down' />
              </button>
              {!auth.loading && user === auth.user._id && (
                <button
                  onClick={() => deleteComment(postId, _id)}
                  type='button'
                  className='btn btn-danger'
                >
                  <i className='fas fa-times' />
                </button>
              )}
            </div>
          </div>
          
          {replies.map((reply) => (
            <ReplyItem key={reply._id} reply={reply} commentId={_id} postId={postId}/>
          ))}

        <div className="my-2">
          <button
            onClick={() => toggleAddReplyBtn(!displayAddReplyBtn)}
            type="button"
            className="btn btn-light"
          >
            Add a Reply
          </button>
        </div>
        {displayAddReplyBtn && (
          <ReplyForm commentId={_id} postId={postId}/>
        )}
      </div>
    );
}

CommentItem.propTypes = {
  
  postId: PropTypes.string.isRequired,
  comment: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  deleteComment: PropTypes.func.isRequired,
  addCommentLike: PropTypes.func.isRequired,
  removeCommentLike: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  post: state.post,
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { deleteComment, addCommentLike, removeCommentLike }
)(CommentItem);
