/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { okaidia } from 'react-syntax-highlighter/styles/prism';

export class ExampleWithSource extends React.Component {
    static propTypes = {
        source: PropTypes.string.isRequired,
        for: PropTypes.func.isRequired
    };

    constructor() {
        super();
        this.state = { hidden: true };
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({ hidden: !this.state.hidden });
    }

    render() {
        const { hidden } = this.state;
        const Component = this.props.for;

        const iconClassName = hidden ? 'icon-navigatedown' : 'icon-navigateup';

        return (
            <div className="example-with-source">
                <style jsx>{`
                    .example-with-source {
                        flex: 1 0 auto;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: stretch;
                    }
                    .source {
                        margin: 20px 0;
                    }
                `}</style>
                <Component />
                <div className="source">
                    <button className={`button button-secondary button-dropdown icon-right ${iconClassName}`} onClick={this.toggle}>source</button>
                    {hidden ? '' : (
                        <SyntaxHighlighter language="jsx" style={okaidia}>{this.props.source}</SyntaxHighlighter>
                    )}
                </div>
            </div>
        );
    }
}

export default ExampleWithSource;
